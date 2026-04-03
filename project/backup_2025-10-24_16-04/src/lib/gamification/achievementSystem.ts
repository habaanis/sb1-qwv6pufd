import { supabase } from '../BoltDatabase';
import { logger } from '../logging/distributedLogger';
import { createNotification } from '../realtime/advancedNotifications';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'explorer' | 'contributor' | 'social' | 'expert' | 'special';
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    threshold: number;
    current?: number;
  }[];
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  title: string;
}

export interface Leaderboard {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  level: number;
  totalXP: number;
  achievementsCount: number;
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'id'>[] = [
  {
    name: 'Premier Pas',
    description: 'Créez votre premier compte',
    icon: '🎯',
    category: 'explorer',
    points: 10,
    rarity: 'common',
    requirements: [{ type: 'account_created', threshold: 1 }]
  },
  {
    name: 'Explorateur',
    description: 'Visitez 10 entreprises différentes',
    icon: '🗺️',
    category: 'explorer',
    points: 25,
    rarity: 'common',
    requirements: [{ type: 'businesses_viewed', threshold: 10 }]
  },
  {
    name: 'Critique',
    description: 'Laissez 5 avis',
    icon: '⭐',
    category: 'contributor',
    points: 50,
    rarity: 'uncommon',
    requirements: [{ type: 'reviews_written', threshold: 5 }]
  },
  {
    name: 'Super Critique',
    description: 'Laissez 25 avis',
    icon: '🌟',
    category: 'contributor',
    points: 150,
    rarity: 'rare',
    requirements: [{ type: 'reviews_written', threshold: 25 }]
  },
  {
    name: 'Influenceur',
    description: '50 personnes ont trouvé vos avis utiles',
    icon: '💫',
    category: 'social',
    points: 200,
    rarity: 'epic',
    requirements: [{ type: 'helpful_votes', threshold: 50 }]
  },
  {
    name: 'Collectionneur',
    description: 'Ajoutez 20 entreprises à vos favoris',
    icon: '❤️',
    category: 'explorer',
    points: 75,
    rarity: 'uncommon',
    requirements: [{ type: 'favorites_added', threshold: 20 }]
  },
  {
    name: 'Chercheur Assidu',
    description: 'Effectuez 100 recherches',
    icon: '🔍',
    category: 'explorer',
    points: 100,
    rarity: 'rare',
    requirements: [{ type: 'searches_performed', threshold: 100 }]
  },
  {
    name: 'Expert Local',
    description: 'Ajoutez 5 nouvelles entreprises à la plateforme',
    icon: '🏆',
    category: 'contributor',
    points: 250,
    rarity: 'epic',
    requirements: [{ type: 'businesses_suggested', threshold: 5 }]
  },
  {
    name: 'Ambassadeur',
    description: 'Parrainez 10 nouveaux utilisateurs',
    icon: '👥',
    category: 'social',
    points: 300,
    rarity: 'epic',
    requirements: [{ type: 'referrals', threshold: 10 }]
  },
  {
    name: 'Légende',
    description: 'Atteignez le niveau 50',
    icon: '👑',
    category: 'special',
    points: 500,
    rarity: 'legendary',
    requirements: [{ type: 'level', threshold: 50 }]
  }
];

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  5: 'Explorateur',
  10: 'Guide',
  15: 'Expert',
  20: 'Maestro',
  25: 'Ambassadeur',
  30: 'Virtuose',
  40: 'Champion',
  50: 'Légende'
};

class AchievementSystem {
  async getUserLevel(userId: string): Promise<UserLevel> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return {
          level: 1,
          currentXP: 0,
          nextLevelXP: 100,
          totalXP: 0,
          title: 'Novice'
        };
      }

      const level = this.calculateLevel(data.total_xp);
      const currentXP = data.total_xp - this.getXPForLevel(level);
      const nextLevelXP = this.getXPForLevel(level + 1) - this.getXPForLevel(level);

      return {
        level,
        currentXP,
        nextLevelXP,
        totalXP: data.total_xp,
        title: this.getLevelTitle(level)
      };
    } catch (error) {
      logger.error('Failed to get user level', error as Error);
      return {
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        totalXP: 0,
        title: 'Novice'
      };
    }
  }

  private calculateLevel(totalXP: number): number {
    let level = 1;
    while (this.getXPForLevel(level + 1) <= totalXP) {
      level++;
    }
    return level;
  }

  private getXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  private getLevelTitle(level: number): string {
    const titleLevels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);

    for (const titleLevel of titleLevels) {
      if (level >= titleLevel) {
        return LEVEL_TITLES[titleLevel];
      }
    }

    return 'Novice';
  }

  async addXP(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ levelUp: boolean; newLevel?: number }> {
    try {
      const currentLevel = await this.getUserLevel(userId);

      const { error } = await supabase
        .from('user_gamification')
        .upsert({
          user_id: userId,
          total_xp: currentLevel.totalXP + amount,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await supabase.from('xp_history').insert({
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString()
      });

      const newLevel = this.calculateLevel(currentLevel.totalXP + amount);
      const levelUp = newLevel > currentLevel.level;

      if (levelUp) {
        await this.handleLevelUp(userId, newLevel);
      }

      logger.info('XP added', { userId, amount, reason, levelUp });

      return { levelUp, newLevel: levelUp ? newLevel : undefined };
    } catch (error) {
      logger.error('Failed to add XP', error as Error);
      return { levelUp: false };
    }
  }

  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    await createNotification(
      userId,
      'achievement',
      `Niveau ${newLevel} atteint !`,
      `Félicitations ! Vous êtes maintenant ${this.getLevelTitle(newLevel)}`,
      {
        icon: '🎉',
        priority: 'high',
        link: '/profile/achievements'
      }
    );

    logger.info('Level up', { userId, newLevel });
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data: unlockedData } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      const unlockedIds = new Set(unlockedData?.map(a => a.achievement_id) || []);

      const userStats = await this.getUserStats(userId);

      const achievements: Achievement[] = ACHIEVEMENTS.map((achievement, index) => {
        const id = `achievement_${index}`;
        const unlocked = unlockedIds.has(id);

        const requirementsWithProgress = achievement.requirements.map(req => ({
          ...req,
          current: userStats[req.type] || 0
        }));

        return {
          ...achievement,
          id,
          unlocked,
          unlockedAt: unlockedData?.find(a => a.achievement_id === id)?.unlocked_at,
          requirements: requirementsWithProgress
        };
      });

      return achievements;
    } catch (error) {
      logger.error('Failed to get user achievements', error as Error);
      return [];
    }
  }

  private async getUserStats(userId: string): Promise<Record<string, number>> {
    const stats: Record<string, number> = {
      account_created: 1,
      businesses_viewed: 0,
      reviews_written: 0,
      helpful_votes: 0,
      favorites_added: 0,
      searches_performed: 0,
      businesses_suggested: 0,
      referrals: 0,
      level: 0
    };

    try {
      const [reviewsData, favoritesData, suggestionsData, levelData] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('business_suggestions').select('*', { count: 'exact', head: true }).eq('submitted_by_email', userId),
        this.getUserLevel(userId)
      ]);

      stats.reviews_written = reviewsData.count || 0;
      stats.favorites_added = favoritesData.count || 0;
      stats.businesses_suggested = suggestionsData.count || 0;
      stats.level = levelData.level;

      const { data: votesData } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('user_id', userId);

      stats.helpful_votes = votesData?.reduce((sum, r) => sum + (r.helpful_count || 0), 0) || 0;

      return stats;
    } catch (error) {
      logger.error('Failed to get user stats', error as Error);
      return stats;
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const newlyUnlocked: Achievement[] = [];

      for (const achievement of achievements) {
        if (!achievement.unlocked) {
          const allRequirementsMet = achievement.requirements.every(
            req => (req.current || 0) >= req.threshold
          );

          if (allRequirementsMet) {
            await this.unlockAchievement(userId, achievement);
            newlyUnlocked.push(achievement);
          }
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Failed to check achievements', error as Error);
      return [];
    }
  }

  private async unlockAchievement(
    userId: string,
    achievement: Achievement
  ): Promise<void> {
    try {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString()
      });

      await this.addXP(userId, achievement.points, `Achievement: ${achievement.name}`);

      await createNotification(
        userId,
        'achievement',
        `Succès débloqué : ${achievement.name}`,
        `${achievement.description} (+${achievement.points} XP)`,
        {
          icon: achievement.icon,
          priority: 'high',
          link: '/profile/achievements'
        }
      );

      logger.info('Achievement unlocked', { userId, achievement: achievement.name });
    } catch (error) {
      logger.error('Failed to unlock achievement', error as Error);
    }
  }

  async getLeaderboard(
    type: 'xp' | 'level' | 'achievements',
    limit: number = 100
  ): Promise<Leaderboard[]> {
    try {
      const { data } = await supabase
        .rpc('get_leaderboard', {
          p_type: type,
          p_limit: limit
        });

      return data || [];
    } catch (error) {
      logger.error('Failed to get leaderboard', error as Error);
      return [];
    }
  }

  async getUserRank(userId: string, type: 'xp' | 'level' | 'achievements'): Promise<number> {
    try {
      const { data } = await supabase
        .rpc('get_user_rank', {
          p_user_id: userId,
          p_type: type
        });

      return data || 0;
    } catch (error) {
      logger.error('Failed to get user rank', error as Error);
      return 0;
    }
  }
}

export const achievementSystem = new AchievementSystem();

export async function getUserLevel(userId: string): Promise<UserLevel> {
  return achievementSystem.getUserLevel(userId);
}

export async function addXP(
  userId: string,
  amount: number,
  reason: string
): Promise<{ levelUp: boolean; newLevel?: number }> {
  return achievementSystem.addXP(userId, amount, reason);
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  return achievementSystem.getUserAchievements(userId);
}

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
  return achievementSystem.checkAndUnlockAchievements(userId);
}

export async function getLeaderboard(
  type: 'xp' | 'level' | 'achievements',
  limit?: number
): Promise<Leaderboard[]> {
  return achievementSystem.getLeaderboard(type, limit);
}

if (typeof window !== 'undefined') {
  (window as any).achievements = achievementSystem;
}

import markSeenMutation from '../mutation/notifier/mark-seen'
import markSeenAfterMutation from '../mutation/notifier/mark-seen-after'
import markThreadSeenMutation from '../mutation/notifier/mark-seen-thread'
import loadNotifications from '../query/notifier/notifications-load'
import {
  MutationNotifications_Seen_AfterArgs,
  NotificationsResult,
  QueryLoad_NotificationsArgs,
} from '../schema/core.gen'
import { apiClient } from './core'

export const notifierClient = {
  private: apiClient.private,
  getNotifications: async (params: QueryLoad_NotificationsArgs): Promise<NotificationsResult> => {
    const resp = await notifierClient.private.query(loadNotifications, params).toPromise()
    return resp.data?.load_notifications
  },

  markSeen: async (notification_id: number): Promise<void> => {
    // call when notification is clicked
    await notifierClient.private.mutation(markSeenMutation, { notification_id }).toPromise()
  },

  markSeenAfter: async (options: MutationNotifications_Seen_AfterArgs): Promise<void> => {
    // call when 'mark all as seen' cliecked
    await notifierClient.private.mutation(markSeenAfterMutation, options).toPromise()
  },
  markSeenThread: async (thread: string): Promise<void> => {
    // call when notification group is clicked
    await notifierClient.private.mutation(markThreadSeenMutation, { thread }).toPromise()
  },
}

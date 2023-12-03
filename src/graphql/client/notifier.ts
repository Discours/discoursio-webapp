import markAllNotificationsAsRead from '../mutation/notifier/mark-all-notifications-as-read'
import markNotificationAsRead from '../mutation/notifier/mark-notification-as-read'
import { createGraphQLClient } from '../createGraphQLClient'
import loadNotifications from '../query/notifier/notifications-load'
import { NotificationsResult, QueryLoad_NotificationsArgs } from '../schema/notifier.gen'

export const notifierClient = {
  private: null,
  connect: () => (notifierClient.private = createGraphQLClient('notifier')),

  getNotifications: async (params: QueryLoad_NotificationsArgs): Promise<NotificationsResult> => {
    const resp = await notifierClient.private.query(loadNotifications, params).toPromise()
    return resp.data.load_notifications
  },
  markNotificationAsRead: async (notification_id: number): Promise<void> => {
    await notifierClient.private
      .mutation(markNotificationAsRead, {
        notification_id,
      })
      .toPromise()
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await notifierClient.private.mutation(markAllNotificationsAsRead, {}).toPromise()
  },
}

import markAllNotificationsAsRead from '../mutation/notifier/mark-all-notifications-as-read'
import markNotificationAsRead from '../mutation/notifier/mark-notification-as-read'
import { getPrivateClient } from '../privateGraphQLClient'
import loadNotifications from '../query/notifier/notifications-load'
import { NotificationsResult, QueryLoad_NotificationsArgs } from '../schema/notifier.gen'

export const notifierPrivateGraphqlClient = getPrivateClient('notifier')

export const notifierClient = {
  getNotifications: async (params: QueryLoad_NotificationsArgs): Promise<NotificationsResult> => {
    const resp = await notifierPrivateGraphqlClient.query(loadNotifications, params).toPromise()
    return resp.data.load_notifications
  },
  markNotificationAsRead: async (notification_id: number): Promise<void> => {
    await notifierPrivateGraphqlClient
      .mutation(markNotificationAsRead, {
        notification_id,
      })
      .toPromise()
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    await notifierPrivateGraphqlClient.mutation(markAllNotificationsAsRead, {}).toPromise()
  },
}

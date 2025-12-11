
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertCircle, Info, Clock, Check, Trash2 } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      default: return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColors = (type: string, read: boolean) => {
    const baseColors = read ? 'bg-neu-100' : 'bg-white'
    const borderColors = {
      success: 'border-l-green-500',
      error: 'border-l-red-500',
      warning: 'border-l-orange-500',
      info: 'border-l-blue-500'
    }
    return `${baseColors} ${borderColors[type as keyof typeof borderColors] || borderColors.info}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 bg-neu-100 shadow-neu-xl border-l border-neu-300 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neu-300 bg-white">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-brutal font-bold text-neu-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Button  size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-4 border-b border-neu-300 bg-neu-50">
                <Button
                  
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
                <Button
                  
                  size="sm"
                  onClick={clearAll}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neu-500">
                  <div className="neu-card p-6 mb-4">
                    <CheckCircle className="h-12 w-12 text-neu-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-sm text-center">You have no new notifications</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`neu-card p-4 border-l-4 ${getNotificationColors(notification.type, notification.read)} hover:shadow-neu-lg transition-all duration-200 cursor-pointer group`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${notification.read ? 'text-neu-700' : 'text-neu-900'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${notification.read ? 'text-neu-500' : 'text-neu-600'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-neu-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <Button
                                  
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {notification.actionUrl && (
                            <Button
                              
                              size="sm"
                              className="mt-3 text-primary-600 hover:text-primary-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle navigation to actionUrl
                                window.location.href = notification.actionUrl!
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

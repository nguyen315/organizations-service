import { Consumer, Message, Producer } from 'redis-smq'

export const consumer = new Consumer()
export const producer = new Producer()
const MESSAGE_TTL = 3600000

export const createMessage = (channel, type, data) =>
  new Message().setBody({ type, data }).setTTL(MESSAGE_TTL).setQueue(channel)

export const initQueue = () => {
  consumer.run()
}

export const REDIS_NAMESPACE = 'Redis'

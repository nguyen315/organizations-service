export const USERS_SERVICE = 'USERS_SERVICE'
export const ADS_SERVICE = 'ADS_SERVICE'
export const RULES_SERVICE = 'RULES_SERVICE'
export const ORGS_SERVICE = 'ORGS_SERVICE'

export const QUEUE_NAME = {
  USERS_ADS_QUEUE: 'USER_ADS_QUEUE',
  ADS_USERS_QUEUE: 'ADS_USERS_QUEUE',
}

export const MESSAGE = {
  [ADS_SERVICE]: {
    FACEBOOK_SERVICES: {
      GET_FACEBOOK_AD_ACCOUNTS: 'GET_FACEBOOK_AD_ACCOUNTS',
      RECEIVE_FACEBOOK_AD_ACCOUNTS: 'RECEIVE_FACEBOOK_AD_ACCOUNTS',
    },
    GOOGLE_SERVICES: {
      GET_GOOGLE_ACCESSIBLE_ACCOUNTS: 'GET_GOOGLE_ACCESSIBLE_ACCOUNTS',
      RECEIVE_GOOGLE_ACCESSIBLE_ACCOUNTS: 'RECEIVE_GOOGLE_ACCESSIBLE_ACCOUNTS',
    },
  },
}

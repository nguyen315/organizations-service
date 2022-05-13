export * as REDIS_SERVICE_KEY from './redis-service-key'

export const ORG_STATUS = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
}

export const MEMBER_PERMISSION = {
  // MEMBERS
  VIEW_MEMBERS: false,
  DELETE_MEMBER: false,
  INVITE_MEMBER: false,
  // ROLES
  VIEW_ROLES: false,
  ASSIGN_ROLE: false,
  REMOVE_ROLE: false,
  CREATE_ROLE: false,
  EDIT_ROLE: false,
  // ADS
  CREATE_ADS: true,
  EDIT_ADS: true,
  PUBLISH_ADS: true,
  SYNC_ADS: true,
  VIEW_ADS: true,
  // RULES
  CREATE_OR_EDIT_RULES_SET: true,
  VIEW_RULES_SET: true,
  DELETE_RULES_SET: true,
}

export const ADMIN_PERMISSION = {
  // MEMBERS
  VIEW_MEMBERS: true,
  DELETE_MEMBER: true,
  INVITE_MEMBER: true,
  // ROLES
  VIEW_ROLES: true,
  ASSIGN_ROLE: true,
  REMOVE_ROLE: true,
  CREATE_ROLE: true,
  EDIT_ROLE: true,
  // ADS
  CREATE_ADS: true,
  EDIT_ADS: true,
  PUBLISH_ADS: true,
  SYNC_ADS: true,
  VIEW_ADS: true,
  // RULES
  CREATE_OR_EDIT_RULES_SET: true,
  DELETE_RULES_SET: true,
  VIEW_RULES_SET: true,
}

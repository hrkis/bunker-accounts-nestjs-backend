export enum user_status {
  pending = 'pending',
  actived = 'actived',
  blocked = 'blocked',
  deleted = 'deleted',
}

export enum user_role {
  BUNKER_ADMIN = 'bunker_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum invite_code_status {
  pending = 'pending',
  used = 'used',
  expired = 'expired',
}

export enum invite_code_type {
  setPassword = 'setPassword',
  resetPassword = 'resetPassword',
}

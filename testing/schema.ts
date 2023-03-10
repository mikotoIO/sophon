// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore } from '@sophon-js/server';

// extend as you need
export interface SophonContext {}

export interface Channel {
  id: string;
  spaceId: string;
  name: string;
  order: number;
  lastUpdated: string;
  type: string;
}

export interface Space {
  id: string;
  name: string;
  channels: Channel[];
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  color: string | null;
  permissions: string;
  position: number;
}

// Services

export class MainServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IMainService {
  
  
}

function fnMainService(
  fn: (props: {
    $: (room: string) => MainServiceSender,
  }) => IMainService,
    meta: { senderFn: (room: string) => MainServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const MainService = Object.assign(fnMainService, {
  SENDER: MainServiceSender,
});


export class ChannelServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  
}

export interface IChannelService {
  
  
}

function fnChannelService(
  fn: (props: {
    $: (room: string) => ChannelServiceSender,
  }) => IChannelService,
    meta: { senderFn: (room: string) => ChannelServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const ChannelService = Object.assign(fnChannelService, {
  SENDER: ChannelServiceSender,
});


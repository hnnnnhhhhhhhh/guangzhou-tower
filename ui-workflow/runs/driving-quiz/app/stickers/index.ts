// 由 scripts/sticker.mjs 生成，不要手改。图源：Microsoft Fluent Emoji（MIT）。
import automobile from './automobile.svg';
import balanceScale from './balance-scale.svg';
import bullseye from './bullseye.svg';
import construction from './construction.svg';
import lightBulb from './light-bulb.svg';
import memo from './memo.svg';
import stopwatch from './stopwatch.svg';
import trophy from './trophy.svg';
import verticalTrafficLight from './vertical-traffic-light.svg';

export const STICKERS = {'automobile': automobile, 'balance-scale': balanceScale, 'bullseye': bullseye, 'construction': construction, 'light-bulb': lightBulb, 'memo': memo, 'stopwatch': stopwatch, 'trophy': trophy, 'vertical-traffic-light': verticalTrafficLight} as const;
export type StickerName = keyof typeof STICKERS;

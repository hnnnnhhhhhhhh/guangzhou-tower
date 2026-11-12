// 由 scripts/sticker.mjs 生成，不要手改。图源：Microsoft Fluent Emoji（MIT）。
import airplane from './airplane.svg';
import bed from './bed.svg';
import cherryBlossom from './cherry-blossom.svg';
import hotSprings from './hot-springs.svg';
import japaneseCastle from './japanese-castle.svg';
import lightBulb from './light-bulb.svg';
import roundPushpin from './round-pushpin.svg';
import shintoShrine from './shinto-shrine.svg';
import shoppingBags from './shopping-bags.svg';
import sparkles from './sparkles.svg';
import steamingBowl from './steaming-bowl.svg';
import tanabataTree from './tanabata-tree.svg';
import teacupWithoutHandle from './teacup-without-handle.svg';
import worldMap from './world-map.svg';

export const STICKERS = {'airplane': airplane, 'bed': bed, 'cherry-blossom': cherryBlossom, 'hot-springs': hotSprings, 'japanese-castle': japaneseCastle, 'light-bulb': lightBulb, 'round-pushpin': roundPushpin, 'shinto-shrine': shintoShrine, 'shopping-bags': shoppingBags, 'sparkles': sparkles, 'steaming-bowl': steamingBowl, 'tanabata-tree': tanabataTree, 'teacup-without-handle': teacupWithoutHandle, 'world-map': worldMap} as const;
export type StickerName = keyof typeof STICKERS;

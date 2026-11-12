// 手机屏外壳：所有屏共用，保证不同模型搭出来的框架一致。
// Astryx 面向 Web，没有“底部标签栏”这个组件，这里用 Layout 的 footer + 铺满的 TabList 组合出来。
// 屏幕文件只负责 header 里的内容和中间的 region，不要自己再搭框架。
import type {ReactNode} from 'react';
import {Layout, LayoutContent, LayoutFooter, LayoutHeader} from '@astryxdesign/core/Layout';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {VStack} from '@astryxdesign/core/VStack';
import {Theme} from '@astryxdesign/core/theme';
import type {DefinedTheme} from '@astryxdesign/core/theme';

export type ShellTab = {value: string; label: string; icon?: ReactNode; selectedIcon?: ReactNode};

export function MobileShell({
  theme,
  header,
  tabs,
  activeTab,
  bottomBar,
  children,
}: {
  theme: DefinedTheme;
  /** 顶部区域的内容（标题、返回、右侧操作）。不传就没有顶栏。 */
  header?: ReactNode;
  /** 底部标签，最多 5 个。不传就没有标签栏。 */
  tabs?: ShellTab[];
  activeTab?: string;
  /** 固定在底部的主操作条（与 tabs 二选一）。 */
  bottomBar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Theme theme={theme} mode="system">
      <VStack height="100dvh" style={{background: 'var(--color-background-body)'}}>
        <Layout
          height="fill"
          header={header ? <LayoutHeader padding={4}>{header}</LayoutHeader> : undefined}
          content={
            <LayoutContent isScrollable padding={4}>
              {children}
            </LayoutContent>
          }
          footer={
            tabs?.length ? (
              <LayoutFooter hasDivider padding={1} role="navigation" label="主导航">
                <TabList value={activeTab ?? tabs[0].value} onChange={() => {}} layout="fill" size="lg">
                  {tabs.slice(0, 5).map((t) => (
                    <Tab key={t.value} value={t.value} label={t.label} icon={t.icon} selectedIcon={t.selectedIcon} />
                  ))}
                </TabList>
              </LayoutFooter>
            ) : bottomBar ? (
              <LayoutFooter hasDivider padding={4}>
                {bottomBar}
              </LayoutFooter>
            ) : undefined
          }
        />
      </VStack>
    </Theme>
  );
}

import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Youtube, Linkedin, MessageSquare, TrendingUp } from "lucide-react";

interface SocialMediaTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface SocialMediaTabsProps {
  tabs: SocialMediaTab[];
  defaultTab?: string;
}

const iconMap: Record<string, ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  tiktok: <MessageSquare className="h-4 w-4" />,
  discord: <MessageSquare className="h-4 w-4" />,
  overview: <TrendingUp className="h-4 w-4" />,
};

export function SocialMediaTabs({ tabs, defaultTab }: SocialMediaTabsProps) {
  const defaultValue = defaultTab || tabs[0]?.id;

  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList className={`grid w-full ${tabs.length <= 4 ? `grid-cols-${tabs.length}` : 'grid-cols-4'} lg:w-auto lg:inline-grid`}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
            {tab.icon || iconMap[tab.id.toLowerCase()]}
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

import React from 'react';
import {
  Droplet,
  BookOpen,
  BookMarked,
  Dumbbell,
  GraduationCap,
  Smartphone,
  Moon,
  Leaf,
  PenTool,
  Footprints,
  Flame,
  Heart,
  Sparkles,
  Coffee,
  Target,
  Trophy,
  Bike,
  Sun,
  Music,
  Shield,
  CheckCircle2,
  LucideProps
} from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Droplet,
  BookOpen,
  BookMarked,
  Dumbbell,
  GraduationCap,
  Smartphone,
  Moon,
  Leaf,
  PenTool,
  Footprints,
  Flame,
  Heart,
  Sparkles,
  Coffee,
  Target,
  Trophy,
  Bike,
  Sun,
  Music,
  Shield,
  CheckCircle2
};

interface HabitIconProps extends LucideProps {
  name: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  const IconComponent = ICON_MAP[name] || CheckCircle2;
  return <IconComponent className={className} {...props} />;
};

'use client'

import {
  Brain, BookOpen, Lightbulb, Target, TrendingUp, Star, Sparkles, Compass, Telescope,
  Heart, Activity, Dumbbell, Bike, Flame, Wind, Footprints, Timer, Zap,
  Apple, Leaf, Droplets, Coffee, UtensilsCrossed, Salad, Pill, Shield,
  Smile, Sun, Moon, Cloud, Rainbow, Flower2, Music, Headphones,
  Users, MessageCircle, Phone, Mail, HandshakeIcon, Globe, Mic,
  Palette, Camera, Pen, Code, Gamepad2, Film, Theater, Scissors,
  Plane, Map, Mountain, Tent, Anchor, Ship, Car, Train,
  Home, Sofa, Wrench, Lightbulb as Bulb, TreePine, Waves, Leaf as LeafAlt,
  DollarSign, BarChart, PiggyBank, Briefcase, TrendingDown, Wallet,
  Inbox, List, CheckSquare, Archive, Flag, Bell, Clock, Calendar,
} from 'lucide-react'

const ICON_SECTIONS = [
  {
    label: 'General',
    icons: [
      { name: 'inbox', Icon: Inbox },
      { name: 'list', Icon: List },
      { name: 'check-square', Icon: CheckSquare },
      { name: 'flag', Icon: Flag },
      { name: 'star', Icon: Star },
      { name: 'target', Icon: Target },
      { name: 'bell', Icon: Bell },
      { name: 'clock', Icon: Clock },
    ],
  },
  {
    label: 'Mind & Growth',
    icons: [
      { name: 'brain', Icon: Brain },
      { name: 'book-open', Icon: BookOpen },
      { name: 'lightbulb', Icon: Lightbulb },
      { name: 'trending-up', Icon: TrendingUp },
      { name: 'sparkles', Icon: Sparkles },
      { name: 'compass', Icon: Compass },
      { name: 'telescope', Icon: Telescope },
      { name: 'zap', Icon: Zap },
    ],
  },
  {
    label: 'Body & Fitness',
    icons: [
      { name: 'activity', Icon: Activity },
      { name: 'dumbbell', Icon: Dumbbell },
      { name: 'bike', Icon: Bike },
      { name: 'flame', Icon: Flame },
      { name: 'wind', Icon: Wind },
      { name: 'footprints', Icon: Footprints },
      { name: 'timer', Icon: Timer },
      { name: 'heart', Icon: Heart },
    ],
  },
  {
    label: 'Nutrition & Health',
    icons: [
      { name: 'apple', Icon: Apple },
      { name: 'leaf', Icon: Leaf },
      { name: 'droplets', Icon: Droplets },
      { name: 'coffee', Icon: Coffee },
      { name: 'utensils-crossed', Icon: UtensilsCrossed },
      { name: 'salad', Icon: Salad },
      { name: 'pill', Icon: Pill },
      { name: 'shield', Icon: Shield },
    ],
  },
  {
    label: 'Emotions & Well-Being',
    icons: [
      { name: 'smile', Icon: Smile },
      { name: 'sun', Icon: Sun },
      { name: 'moon', Icon: Moon },
      { name: 'cloud', Icon: Cloud },
      { name: 'rainbow', Icon: Rainbow },
      { name: 'flower2', Icon: Flower2 },
      { name: 'music', Icon: Music },
      { name: 'headphones', Icon: Headphones },
    ],
  },
  {
    label: 'Human & Communication',
    icons: [
      { name: 'users', Icon: Users },
      { name: 'message-circle', Icon: MessageCircle },
      { name: 'phone', Icon: Phone },
      { name: 'mail', Icon: Mail },
      { name: 'handshake', Icon: HandshakeIcon },
      { name: 'globe', Icon: Globe },
      { name: 'mic', Icon: Mic },
    ],
  },
  {
    label: 'Hobbies & Creativity',
    icons: [
      { name: 'palette', Icon: Palette },
      { name: 'camera', Icon: Camera },
      { name: 'pen', Icon: Pen },
      { name: 'code', Icon: Code },
      { name: 'gamepad2', Icon: Gamepad2 },
      { name: 'film', Icon: Film },
      { name: 'theater', Icon: Theater },
      { name: 'scissors', Icon: Scissors },
    ],
  },
  {
    label: 'Travel & Adventure',
    icons: [
      { name: 'plane', Icon: Plane },
      { name: 'map', Icon: Map },
      { name: 'mountain', Icon: Mountain },
      { name: 'tent', Icon: Tent },
      { name: 'anchor', Icon: Anchor },
      { name: 'ship', Icon: Ship },
      { name: 'car', Icon: Car },
      { name: 'train', Icon: Train },
    ],
  },
  {
    label: 'Home & Environment',
    icons: [
      { name: 'home', Icon: Home },
      { name: 'sofa', Icon: Sofa },
      { name: 'wrench', Icon: Wrench },
      { name: 'tree-pine', Icon: TreePine },
      { name: 'waves', Icon: Waves },
    ],
  },
  {
    label: 'Financial',
    icons: [
      { name: 'dollar-sign', Icon: DollarSign },
      { name: 'bar-chart', Icon: BarChart },
      { name: 'piggy-bank', Icon: PiggyBank },
      { name: 'briefcase', Icon: Briefcase },
      { name: 'trending-down', Icon: TrendingDown },
      { name: 'wallet', Icon: Wallet },
    ],
  },
]

// Flat lookup map
export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> =
  Object.fromEntries(
    ICON_SECTIONS.flatMap((s) => s.icons.map(({ name, Icon }) => [name, Icon]))
  )

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  color?: string
}

export function IconPicker({ value, onChange, color = '#f97316' }: IconPickerProps) {
  return (
    <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
      {ICON_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-2">
            {section.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {section.icons.map(({ name, Icon }) => {
              const selected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange(name)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: selected ? color : '#1a2235',
                    border: selected ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  <Icon
                    size={16}
                    className={selected ? 'text-white' : 'text-[#94a3b8]'}
                  />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

import type { ReactNode } from 'react'
import type { Category } from '../types'

function Svg({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const CalendarIcon = () => (
  <Svg>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />
  </Svg>
)

export const ChecklistIcon = () => (
  <Svg>
    <path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9" />
  </Svg>
)

export const BackIcon = () => (
  <Svg size={26}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
)

export const ChevronIcon = () => (
  <Svg size={18}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
)

export const MoreIcon = () => (
  <Svg>
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
  </Svg>
)

export const PlusIcon = () => (
  <Svg>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const UsersIcon = () => (
  <Svg>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5a3 3 0 010 6M18 14c2 .6 3 2.3 3 5" />
  </Svg>
)

export const LinkIcon = () => (
  <Svg size={16}>
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
  </Svg>
)

export const TrashIcon = () => (
  <Svg size={18}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
)

const categoryPaths: Record<Category, ReactNode> = {
  move: (
    <>
      <rect x="6" y="3" width="12" height="14" rx="3" />
      <path d="M6 11h12M9 21l1.5-4M15 21l-1.5-4" />
      <circle cx="9" cy="14" r=".6" fill="currentColor" />
      <circle cx="15" cy="14" r=".6" fill="currentColor" />
    </>
  ),
  food: <path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M16 21V3c-2 1.5-3 4-3 7h3" />,
  sightseeing: (
    <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  hotel: <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7 11.5a1.5 1.5 0 100-.01" />,
  other: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </>
  ),
}

export const CategoryIcon = ({ category }: { category: Category }) => (
  <Svg>{categoryPaths[category] ?? categoryPaths.other}</Svg>
)

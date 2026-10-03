type StarConfig = {
  top: string
  left: string
  size: number
  delay: string
  duration: string
  drift?: boolean
}

type MeteorConfig = {
  top: string
  width: number
  delay: string
  duration: string
}

type DustConfig = {
  top: string
  left: string
  delay: string
  duration: string
}

function buildStars(count: number): StarConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    top: `${(index * 13.7 + 4) % 96}%`,
    left: `${(index * 19.3 + 7) % 97}%`,
    size: index % 4 === 0 ? 2 : 1,
    delay: `${(index % 12) * 0.25}s`,
    duration: `${1.8 + (index % 6) * 0.45}s`,
    drift: index % 3 === 0,
  }))
}

function buildMeteors(count: number): MeteorConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    top: `${(index * 5.8 + 4) % 94}%`,
    width: 70 + (index % 5) * 28,
    delay: `${-(index * 1.7) % 14}s`,
    duration: `${4.5 + (index % 6) * 0.9}s`,
  }))
}

export const starFieldDeep = buildStars(55)
export const starFieldMid = buildStars(40).map((star, index) => ({
  ...star,
  top: `${(index * 11.1 + 2) % 94}%`,
  left: `${(index * 17.9 + 5) % 95}%`,
  delay: `${(index % 8) * 0.4}s`,
}))

export const meteors = buildMeteors(18)

export const spaceDust: DustConfig[] = Array.from({ length: 24 }, (_, index) => ({
  top: `${(index * 23.5 + 10) % 90}%`,
  left: `${(index * 31.2 + 6) % 92}%`,
  delay: `${(index % 10) * 0.6}s`,
  duration: `${12 + (index % 5) * 3}s`,
}))

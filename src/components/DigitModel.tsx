import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Digit, DigitStroke, ViewerSettings } from '../types/digit'

/*
 * Continuous center lines for the digits.
 * Each digit is drawn as one connected path wherever possible.
 */
const strokeMap: Record<Digit, DigitStroke[]> = {
  0: [
    [
      [0.0, 1.4],
      [-0.42, 1.3],
      [-0.72, 0.95],
      [-0.82, 0.45],
      [-0.82, -0.45],
      [-0.72, -0.95],
      [-0.42, -1.3],
      [0.0, -1.4],
      [0.42, -1.3],
      [0.72, -0.95],
      [0.82, -0.45],
      [0.82, 0.45],
      [0.72, 0.95],
      [0.42, 1.3],
      [0.0, 1.4],
    ],
  ],

  1: [
    [
      [-0.35, 0.95],
      [0.05, 1.35],
      [0.25, 1.45],
      [0.25, -1.35],
    ],
  ],

  2: [
    [
      [-0.75, 0.9],
      [-0.55, 1.25],
      [-0.15, 1.42],
      [0.3, 1.4],
      [0.65, 1.15],
      [0.75, 0.8],
      [0.65, 0.45],
      [0.35, 0.1],
      [-0.05, -0.25],
      [-0.45, -0.65],
      [-0.75, -1.05],
      [-0.85, -1.3],
      [0.8, -1.3],
    ],
  ],

  3: [
    [
      [-0.7, 1.15],
      [-0.35, 1.38],
      [0.15, 1.42],
      [0.55, 1.25],
      [0.7, 0.95],
      [0.65, 0.65],
      [0.45, 0.35],
      [0.05, 0.15],
      [0.45, 0.05],
      [0.7, -0.2],
      [0.75, -0.55],
      [0.62, -0.95],
      [0.3, -1.25],
      [-0.15, -1.4],
      [-0.55, -1.25],
      [-0.75, -0.95],
    ],
  ],

  4: [
    [
      [0.35, -1.35],
      [0.35, 1.35],
      [-0.8, -0.3],
      [0.85, -0.3],
    ],
  ],

  5: [
    [
      [0.75, 1.35],
      [-0.7, 1.35],
      [-0.8, 0.15],
      [-0.4, 0.05],
      [0.15, 0.1],
      [0.55, -0.05],
      [0.7, -0.4],
      [0.65, -0.8],
      [0.4, -1.15],
      [0.0, -1.38],
      [-0.4, -1.3],
      [-0.7, -1.05],
    ],
  ],

  6: [
    [
      [0.65, 1.25],
      [0.25, 1.4],
      [-0.2, 1.25],
      [-0.5, 0.85],
      [-0.7, 0.3],
      [-0.75, -0.45],
      [-0.6, -0.95],
      [-0.25, -1.3],
      [0.2, -1.38],
      [0.55, -1.15],
      [0.7, -0.75],
      [0.65, -0.35],
      [0.4, -0.05],
      [0.0, 0.05],
      [-0.4, -0.05],
    ],
  ],

  7: [
    [
      [-0.8, 1.3],
      [0.8, 1.3],
      [0.45, 0.7],
      [0.15, 0.1],
      [-0.1, -0.55],
      [-0.35, -1.35],
    ],
  ],

  8: [
    [
      [-0.05, 0],
      [-0.45, 0.2],
      [-0.65, 0.5],
      [-0.65, 0.9],
      [-0.5, 1.25],
      [-0.15, 1.45],
      [0.2, 1.4],
      [0.5, 1.15],
      [0.6, 0.8],
      [0.55, 0.45],
      [0.3, 0.15],
      [-0.05, 0],
      [-0.4, -0.2],
      [-0.6, -0.5],
      [-0.62, -0.9],
      [-0.45, -1.25],
      [-0.1, -1.45],
      [0.3, -1.35],
      [0.55, -1.05],
      [0.62, -0.7],
      [0.55, -0.4],
      [0.3, -0.15],
      [-0.05, 0],
    ],
  ],

  9: [
    [
      [-0.55, -1.25],
      [-0.15, -1.4],
      [0.25, -1.25],
      [0.55, -0.9],
      [0.7, -0.4],
      [0.7, 0.45],
      [0.55, 0.95],
      [0.25, 1.3],
      [-0.15, 1.42],
      [-0.5, 1.2],
      [-0.7, 0.85],
      [-0.7, 0.45],
      [-0.55, 0.1],
      [-0.25, -0.05],
      [0.15, 0.0],
      [0.5, 0.2],
      [0.65, 0.55],
    ],
  ],
}

const colors = {
  glass: '#76e6c5',
  chrome: '#d9e5ef',
  candy: '#ff8c69',
}

/*
 * Calculate the total length of a stroke.
 */
function getStrokeLength(points: DigitStroke) {
  let length = 0

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0]
    const dy = points[i + 1][1] - points[i][1]

    length += Math.sqrt(dx * dx + dy * dy)
  }

  return length
}

/*
 * Get the position at a specific distance along
 * the continuous line.
 */
function getPointAtDistance(
  points: DigitStroke,
  distance: number,
): [number, number] {
  let travelled = 0

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]

    const dx = b[0] - a[0]
    const dy = b[1] - a[1]

    const segmentLength = Math.sqrt(
      dx * dx + dy * dy,
    )

    if (
      travelled + segmentLength >=
      distance
    ) {
      const local =
        (distance - travelled) /
        segmentLength

      return [
        a[0] + dx * local,
        a[1] + dy * local,
      ]
    }

    travelled += segmentLength
  }

  return points[points.length - 1]
}

/*
 * Create a thick connected 2D outline around
 * the centerline.
 */
function createJoinedShape(
  points: DigitStroke,
  thickness: number,
  progress: number,
) {
  const shape = new THREE.Shape()

  if (points.length < 2) {
    return shape
  }

  const totalLength =
    getStrokeLength(points)

  const visibleLength =
    totalLength * progress

  const sampleCount = Math.max(
    8,
    Math.ceil(visibleLength * 12),
  )

  const left: [number, number][] = []
  const right: [number, number][] = []

  for (let i = 0; i <= sampleCount; i++) {
    const distance =
      (visibleLength * i) /
      sampleCount

    const p = getPointAtDistance(
      points,
      distance,
    )

    const before = getPointAtDistance(
      points,
      Math.max(0, distance - 0.01),
    )

    const after = getPointAtDistance(
      points,
      Math.min(
        totalLength,
        distance + 0.01,
      ),
    )

    const dx = after[0] - before[0]
    const dy = after[1] - before[1]

    const len = Math.sqrt(
      dx * dx + dy * dy,
    )

    if (len === 0) {
      continue
    }

    /*
     * Perpendicular direction.
     */
    const nx = -dy / len
    const ny = dx / len

    const radius = thickness / 2

    left.push([
      p[0] + nx * radius,
      p[1] + ny * radius,
    ])

    right.push([
      p[0] - nx * radius,
      p[1] - ny * radius,
    ])
  }

  if (left.length < 2) {
    return shape
  }

  /*
   * Left side.
   */
  shape.moveTo(
    left[0][0],
    left[0][1],
  )

  for (let i = 1; i < left.length; i++) {
    shape.lineTo(
      left[i][0],
      left[i][1],
    )
  }

  /*
   * Rounded end.
   */
  const end = left[left.length - 1]
  const endRight =
    right[right.length - 1]

  shape.lineTo(
    endRight[0],
    endRight[1],
  )

  /*
   * Right side backwards.
   */
  for (
    let i = right.length - 2;
    i >= 0;
    i--
  ) {
    shape.lineTo(
      right[i][0],
      right[i][1],
    )
  }

  /*
   * Close the beginning.
   */
  shape.closePath()

  return shape
}

function Joined3DStroke({
  points,
  settings,
  color,
  progress,
}: {
  points: DigitStroke
  settings: ViewerSettings
  color: string
  progress: number
}) {
  const thickness = Math.max(
    0.12,
    settings.thickness * 0.28,
  )

  const depth = Math.max(
    0.12,
    settings.thickness,
  )

  const shape = useMemo(
    () =>
      createJoinedShape(
        points,
        thickness,
        progress,
      ),
    [
      points,
      thickness,
      progress,
    ],
  )

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(
      shape,
      {
        depth,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.025,
        bevelThickness: 0.025,
        curveSegments: 8,
      },
    )
  }, [shape, depth])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      metalness:
        settings.material === 'chrome'
          ? 0.9
          : 0.25,
      roughness:
        settings.material === 'glass'
          ? 0.15
          : 0.3,
      wireframe: settings.wireframe,
    })
  }, [
    color,
    settings.material,
    settings.wireframe,
  ])

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  /*
   * The extrusion starts small and grows into
   * the final 3D depth.
   */
  const depthProgress =
    Math.min(
      1,
      Math.max(
        0,
        (progress - 0.45) /
          0.55,
      ),
    )

  const zScale =
    Math.max(
      0.04,
      depthProgress,
    )

  return (
    <mesh
      geometry={geometry}
      material={material}
      scale={[1, 1, zScale]}
      castShadow
      receiveShadow
    />
  )
}

export function DigitModel({
  digit,
  settings,
  variation = 1,
}: {
  digit: Digit
  settings: ViewerSettings
  variation?: number
}) {
  const [progress, setProgress] =
    useState(0)

  const animationFrame =
    useRef<number | null>(null)

  const color = colors[
    settings.material
  ]

  /*
   * Draw the number from beginning
   * to end whenever a new number opens.
   */
  useEffect(() => {
    setProgress(0)

    const start =
      performance.now()

    const duration = 3000

    const animate = (
      currentTime: number,
    ) => {
      const elapsed =
        currentTime - start

      const raw =
        Math.min(
          elapsed / duration,
          1,
        )

      /*
       * Smooth drawing.
       */
      const eased =
        raw < 0.5
          ? 2 * raw * raw
          : 1 -
            Math.pow(
              -2 * raw + 2,
              2,
            ) /
              2

      setProgress(eased)

      if (raw < 1) {
        animationFrame.current =
          requestAnimationFrame(
            animate,
          )
      }
    }

    animationFrame.current =
      requestAnimationFrame(
        animate,
      )

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        )
      }
    }
  }, [digit, variation])

  /*
   * Slight 3D rotation.
   */
  const rotation = useMemo(() => {
    const tilt =
      ((variation % 3) - 1) *
      0.025

    return [
      0.04,
      -0.15 + tilt,
      tilt,
    ] as [
      number,
      number,
      number,
    ]
  }, [variation])

  const strokes =
    strokeMap[digit]

  return (
    <group
      scale={settings.scale}
      rotation={rotation}
    >
      {strokes.map(
        (stroke, index) => (
          <Joined3DStroke
            key={`${digit}-${index}`}
            points={stroke}
            settings={settings}
            color={color}
            progress={progress}
          />
        ),
      )}
    </group>
  )
}

export function getDigitStats(
  digit: Digit,
  settings: ViewerSettings,
) {
  const strokes =
    strokeMap[digit]

  const segments =
    strokes.reduce(
      (total, stroke) =>
        total +
        Math.max(
          0,
          stroke.length - 1,
        ),
      0,
    )

  const points =
    strokes.reduce(
      (total, stroke) =>
        total + stroke.length,
      0,
    )

  return {
    width: `${(
      1.8 *
      settings.scale
    ).toFixed(1)} u`,

    height: `${(
      2.9 *
      settings.scale
    ).toFixed(1)} u`,

    depth: `${(
      settings.thickness
    ).toFixed(2)} u`,

    vertices:
      Math.max(
        500,
        points * 40 +
          segments * 30,
      ),

    triangles:
      Math.max(
        300,
        points * 60 +
          segments * 45,
      ),
  }
}
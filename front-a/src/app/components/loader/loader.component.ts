import { Component, type ElementRef, type OnDestroy, type AfterViewInit, ViewChild } from "@angular/core"

@Component({
  selector: "app-loader",
  templateUrl : './loader.component.html',
  styleUrls: ["./loader.component.css"],
})
export class LoaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild("tangramCanvas") canvasRef!: ElementRef<HTMLCanvasElement>
  private ctx!: CanvasRenderingContext2D
  private animationFrame!: number
  private currentState = 0
  private nextState = 1
  private animationProgress = 0
  private animationSpeed = 0.008
  private transitionCount = 0
  private maxTransitions = 6

  // Original colors
  private colors = {
    blue: "#4999C8",
    teal: "#49C8B1",
    purple: "#8A49C8",
    orange: "#C87949",
    yellow: "#C8BE49",
  }
  
  
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement
    this.ctx = canvas.getContext("2d")!
    canvas.width = 400
    canvas.height = 600
    this.animate()
  }

  /**
   * Easing function for smooth animation
   */
  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * Main animation loop
   */
  animate(): void {
    this.animationFrame = requestAnimationFrame(() => this.animate())
    const canvas = this.canvasRef.nativeElement

    // Clear the canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update animation progress
    this.animationProgress += this.animationSpeed

    // If animation has completed a cycle
    if (this.animationProgress >= 1) {
      this.animationProgress = 0
      this.currentState = this.nextState
      this.nextState = (this.nextState + 1) % 3

      // Increment transition counter
      this.transitionCount++
      if (this.transitionCount >= this.maxTransitions) {
        this.transitionCount = 0
      }
    }

    // Draw the interpolated state
    this.drawInterpolatedState(this.animationProgress)
  }

  /**
   * Draw the interpolated state between current and next figure
   */
  drawInterpolatedState(progress: number): void {
    const easedProgress = this.easeInOutCubic(progress)
    const centerX = this.canvasRef.nativeElement.width / 2
    const centerY = this.canvasRef.nativeElement.height / 2
    const size = Math.min(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height) * 0.8

    this.ctx.save()
    this.ctx.translate(centerX, centerY)

    // Draw the interpolated figure
    this.drawInterpolatedFigure(this.currentState, this.nextState, easedProgress, size)

    this.ctx.restore()
  }

  /**
   * Draw an interpolated figure between two states
   */
  drawInterpolatedFigure(currentState: number, nextState: number, progress: number, size: number): void {
    // Get the piece data for both states
    const currentPieces = this.getPiecesForState(currentState, size)
    const nextPieces = this.getPiecesForState(nextState, size)

    // Draw each piece with interpolation
    for (let i = 0; i < currentPieces.length; i++) {
      const currentPiece = currentPieces[i]
      const nextPiece = nextPieces[i]

      // Draw the interpolated piece
      this.drawInterpolatedPiece(currentPiece, nextPiece, progress)
    }
  }

  /**
   * Get the pieces data for a specific state
   */
  getPiecesForState(state: number, size: number): any[] {
    const half = size / 2,
      quarter = size / 4,
      eighth = size / 8
    const pieces: any[] = []

    switch (state) {
      case 0: // Figure 73
        // Piece 1: Cabeza (rotated square)
        pieces.push({
          type: "square",
          x: -quarter / 2,
          y: -half - quarter,
          size: quarter,
          angle: 45,
          color: this.colors.blue,
        })

        // Piece 2: Triángulo detrás de la cabeza
        const headBottomY = -half,
          offsetRight = quarter - 55
        pieces.push({
          type: "triangle",
          points: [
            [offsetRight, headBottomY],
            [offsetRight - eighth - 20, headBottomY + 19 + eighth],
            [offsetRight, headBottomY + 2.8 * eighth],
          ],
          color: this.colors.teal,
        })

        // Piece 3: Romboidee volteado
        const A = { x: offsetRight + 4, y: headBottomY }
        const B = { x: offsetRight + (eighth + 20), y: headBottomY + (19 + eighth) }
        const C = { x: offsetRight + 3.25, y: headBottomY + 2.88 * eighth }
        const D = { x: offsetRight + 59, y: headBottomY + 2.75 * eighth + (19 + eighth) }
        pieces.push({
          type: "polygon",
          points: [
            [A.x, A.y],
            [B.x, B.y],
            [D.x, D.y],
            [C.x, C.y],
          ],
          color: this.colors.purple,
        })

        // Piece 4: Triángulo del cuerpo medio
        const T1 = { x: offsetRight - eighth - 19.2, y: headBottomY + 4.5 + (19 + eighth) }
        const T2 = { x: offsetRight + 57, y: headBottomY + 2.8 * eighth + (19 + eighth) }
        const T3 = { x: T1.x, y: T2.y + 90 }
        pieces.push({
          type: "triangle",
          points: [
            [T1.x, T1.y],
            [T2.x, T2.y],
            [T3.x, T3.y],
          ],
          color: this.colors.orange,
        })

        // Piece 5: Triángulo simulando los pies
        const nV1 = { x: offsetRight - eighth + 95, y: -headBottomY + (-55 + eighth) }
        const nV2 = { x: offsetRight + 58, y: headBottomY + 2.88 * eighth + (19 + eighth) }
        const nV3 = { x: nV1.x - 160, y: nV2.y + 130 }
        pieces.push({
          type: "triangle",
          points: [
            [nV1.x, nV1.y],
            [nV2.x, nV2.y],
            [nV3.x, nV3.y],
          ],
          color: this.colors.yellow,
        })

        // Piece 6: Brazo
        const nT1 = { x: offsetRight - eighth - 22.8, y: headBottomY + 5 + (19 + eighth) }
        const nT2 = { x: nT1.x, y: nT1.y + 100 }
        const nT3 = { x: nT1.x - 110, y: nT1.y }
        pieces.push({
          type: "triangle",
          points: [
            [nT1.x, nT1.y],
            [nT2.x, nT2.y],
            [nT3.x, nT3.y],
          ],
          color: this.colors.blue,
        })

        // Piece 7: Terminación de la mano
        const mT1 = { x: nT2.x, y: nT2.y + 4.5 }
        const mT2 = { x: mT1.x - 84, y: mT1.y - 75 }
        const mT3 = { x: mT1.x - 80, y: mT1.y }
        pieces.push({
          type: "triangle",
          points: [
            [mT1.x, mT1.y],
            [mT2.x, mT2.y],
            [mT3.x, mT3.y],
          ],
          color: this.colors.yellow,
        })
        break

      case 1: // Figure 156
        // Piece 1: Triangle at top
        pieces.push({
          type: "triangle",
          points: [
            [-quarter, -half],
            [quarter, -half],
            [0, -quarter],
          ],
          color: this.colors.purple,
        })

        // Piece 2: Rotated right triangle
        pieces.push({
          type: "rightTriangle",
          x: -half + 158,
          y: half - 237,
          width: 70,
          height: 75,
          angle: 135,
          color: this.colors.blue,
        })

        // Piece 3: Another rotated right triangle
        pieces.push({
          type: "rightTriangle",
          x: half - 210,
          y: half - 184,
          width: 150,
          height: 150,
          angle: -45,
          color: this.colors.yellow,
        })

        // Piece 4: Third rotated right triangle
        pieces.push({
          type: "rightTriangle",
          x: -half + 106.2,
          y: half - 185,
          width: 70,
          height: 75,
          angle: 135,
          color: this.colors.teal,
        })

        // Piece 5: Parallelogram
        pieces.push({
          type: "parallelogram",
          x: -half + 220,
          y: half - 190,
          width: 62,
          height: 110,
          angle: -30,
          color: this.colors.teal,
        })

        // Piece 6: Rotated square
        pieces.push({
          type: "square",
          x: -86,
          y: -7,
          size: 68,
          angle: 45,
          color: this.colors.yellow,
        })

        // Piece 7: Last rotated right triangle
        pieces.push({
          type: "rightTriangle",
          x: -half + 158.5,
          y: half - 130,
          width: 140,
          height: 140,
          angle: 45,
          color: this.colors.orange,
        })
        break

      case 2: // Figure 200
        const parallelogramWidth = 65,
          parallelogramHeight = 50
        const parallelogramX = -140,
          parallelogramY = -140

        // Piece 1: Parallelogram
        pieces.push({
          type: "parallelogram",
          x: parallelogramX,
          y: parallelogramY,
          width: parallelogramWidth,
          height: parallelogramHeight,
          angle: 140,
          color: this.colors.blue,
        })

        // Piece 2: Rotated right triangle
        const triangleX = parallelogramX + parallelogramWidth / 2
        const triangleY = parallelogramY + parallelogramHeight
        pieces.push({
          type: "rightTriangle",
          x: triangleX + 33,
          y: triangleY + 4,
          width: parallelogramWidth,
          height: parallelogramHeight + 4,
          angle: 180,
          color: this.colors.orange,
        })

        // Piece 3: Another rotated right triangle
        const topPointX = parallelogramX + parallelogramWidth
        const topPointY = parallelogramY
        const bottomPointX = triangleX + parallelogramWidth
        const bottomPointY = triangleY + parallelogramHeight
        pieces.push({
          type: "rightTriangle",
          x: topPointX + 3.5,
          y: topPointY + 54,
          width: bottomPointX - topPointX + 76,
          height: bottomPointY - topPointY + 30,
          angle: 270,
          color: this.colors.teal,
        })

        // Piece 4: Small rotated right triangle
        const baseSmallTriangleX = triangleX
        const baseSmallTriangleY = triangleY + parallelogramHeight
        const newTriangleEndX = baseSmallTriangleX + 100
        const newTriangleEndY = baseSmallTriangleY + 50
        pieces.push({
          type: "rightTriangle",
          x: baseSmallTriangleX + 97,
          y: baseSmallTriangleY - 42.5,
          width: newTriangleEndX - baseSmallTriangleX + 20,
          height: newTriangleEndY - baseSmallTriangleY + 80,
          angle: 90,
          color: this.colors.purple,
        })

        // Piece 5: Another rotated right triangle
        const baseTriangleX = parallelogramX + parallelogramWidth / 2
        const baseTriangleY = parallelogramY + parallelogramHeight
        pieces.push({
          type: "rightTriangle",
          x: baseTriangleX + 100,
          y: baseTriangleY + 8,
          width: parallelogramWidth,
          height: parallelogramHeight + 4,
          angle: 0,
          color: this.colors.orange,
        })

        // Piece 6: Yet another rotated right triangle
        pieces.push({
          type: "rightTriangle",
          x: baseTriangleX + 169,
          y: baseTriangleY + 8.8,
          width: parallelogramWidth + 15,
          height: parallelogramHeight + 41,
          angle: 49.5,
          color: this.colors.yellow,
        })

        // Piece 7: Square
        const lastTriangleX = baseTriangleX + 170
        const lastTriangleY = baseTriangleY + 8.5
        const triangleBottomOffset = (parallelogramWidth + 15) * Math.sin((50 * Math.PI) / 180)
        const bottomEdgeY = lastTriangleY + triangleBottomOffset
        const triangleCenterX = lastTriangleX - 6.13
        const squareSize = 100,
          gap = 10
        const squareX = triangleCenterX - squareSize / 2
        const squareY = bottomEdgeY + gap
        pieces.push({
          type: "square",
          x: squareX - 13,
          y: squareY - 8,
          size: squareSize - 43,
          angle: 0,
          color: this.colors.blue,
        })
        break
    }

    return pieces
  }

  /**
   * Interpolate between two hex colors
   */
  interpolateColor(color1: string, color2: string, factor: number): string {
    // Convert hex to RGB
    const hex1 = color1.replace("#", "")
    const hex2 = color2.replace("#", "")

    // Parse the hex values to get R, G, B components
    const r1 = Number.parseInt(hex1.substring(0, 2), 16)
    const g1 = Number.parseInt(hex1.substring(2, 4), 16)
    const b1 = Number.parseInt(hex1.substring(4, 6), 16)

    const r2 = Number.parseInt(hex2.substring(0, 2), 16)
    const g2 = Number.parseInt(hex2.substring(2, 4), 16)
    const b2 = Number.parseInt(hex2.substring(4, 6), 16)

    // Interpolate each component
    const r = Math.round(r1 + factor * (r2 - r1))
    const g = Math.round(g1 + factor * (g2 - g1))
    const b = Math.round(b1 + factor * (b2 - b1))

    // Convert back to hex
    const rHex = r.toString(16).padStart(2, "0")
    const gHex = g.toString(16).padStart(2, "0")
    const bHex = b.toString(16).padStart(2, "0")

    return `#${rHex}${gHex}${bHex}`
  }

  /**
   * Draw an interpolated piece between two states
   */
  drawInterpolatedPiece(currentPiece: any, nextPiece: any, progress: number): void {
    // Interpolate the color
    const interpolatedColor = this.interpolateColor(currentPiece.color, nextPiece.color, progress)

    // Handle different piece types
    if (currentPiece.type === "square" && nextPiece.type === "square") {
      // Interpolate square properties
      const x = this.interpolate(currentPiece.x, nextPiece.x, progress)
      const y = this.interpolate(currentPiece.y, nextPiece.y, progress)
      const size = this.interpolate(currentPiece.size, nextPiece.size, progress)
      const angle = this.interpolate(currentPiece.angle, nextPiece.angle, progress)

      this.drawRotatedSquare(x, y, size, angle, interpolatedColor)
    } else if (currentPiece.type === "triangle" && nextPiece.type === "triangle") {
      // Interpolate triangle points
      const points = []
      for (let i = 0; i < 3; i++) {
        points.push([
          this.interpolate(currentPiece.points[i][0], nextPiece.points[i][0], progress),
          this.interpolate(currentPiece.points[i][1], nextPiece.points[i][1], progress),
        ])
      }

      this.drawTriangle(
        points[0][0],
        points[0][1],
        points[1][0],
        points[1][1],
        points[2][0],
        points[2][1],
        interpolatedColor,
      )
    } else if (currentPiece.type === "polygon" && nextPiece.type === "polygon") {
      // Interpolate polygon points
      const points = []
      const maxPoints = Math.max(currentPiece.points.length, nextPiece.points.length)

      for (let i = 0; i < maxPoints; i++) {
        const currentPoint = currentPiece.points[i % currentPiece.points.length]
        const nextPoint = nextPiece.points[i % nextPiece.points.length]

        points.push([
          this.interpolate(currentPoint[0], nextPoint[0], progress),
          this.interpolate(currentPoint[1], nextPoint[1], progress),
        ])
      }

      this.drawPolygon(points, interpolatedColor)
    } else if (currentPiece.type === "rightTriangle" && nextPiece.type === "rightTriangle") {
      // Interpolate right triangle properties
      const x = this.interpolate(currentPiece.x, nextPiece.x, progress)
      const y = this.interpolate(currentPiece.y, nextPiece.y, progress)
      const width = this.interpolate(currentPiece.width, nextPiece.width, progress)
      const height = this.interpolate(currentPiece.height, nextPiece.height, progress)
      const angle = this.interpolate(currentPiece.angle, nextPiece.angle, progress)

      this.drawRotatedRightTriangle(x, y, width, height, angle, interpolatedColor)
    } else if (currentPiece.type === "parallelogram" && nextPiece.type === "parallelogram") {
      // Interpolate parallelogram properties
      const x = this.interpolate(currentPiece.x, nextPiece.x, progress)
      const y = this.interpolate(currentPiece.y, nextPiece.y, progress)
      const width = this.interpolate(currentPiece.width, nextPiece.width, progress)
      const height = this.interpolate(currentPiece.height, nextPiece.height, progress)
      const angle = this.interpolate(currentPiece.angle, nextPiece.angle, progress)

      this.drawParallelogramInclined(x, y, width, height, angle, interpolatedColor)
    } else {
      // If types don't match, try to convert to polygon and interpolate
      this.interpolateMixedPieces(currentPiece, nextPiece, progress, interpolatedColor)
    }
  }

  /**
   * Interpolate between pieces of different types by converting to polygons
   */
  interpolateMixedPieces(currentPiece: any, nextPiece: any, progress: number, interpolatedColor: string): void {
    // Convert both pieces to polygon points
    const currentPoints = this.pieceToPoints(currentPiece)
    const nextPoints = this.pieceToPoints(nextPiece)

    // Interpolate between the points
    const points = []
    const maxPoints = Math.max(currentPoints.length, nextPoints.length)

    for (let i = 0; i < maxPoints; i++) {
      const currentPoint = currentPoints[i % currentPoints.length]
      const nextPoint = nextPoints[i % nextPoints.length]

      points.push([
        this.interpolate(currentPoint[0], nextPoint[0], progress),
        this.interpolate(currentPoint[1], nextPoint[1], progress),
      ])
    }

    // Draw the interpolated polygon with the interpolated color
    this.drawPolygon(points, interpolatedColor)
  }

  /**
   * Convert any piece type to polygon points
   */
  pieceToPoints(piece: any): number[][] {
    if (piece.type === "triangle" || piece.type === "polygon") {
      return piece.points
    } else if (piece.type === "square") {
      const halfSize = piece.size / 2
      // Convert to center-based coordinates
      const centerX = piece.x + halfSize
      const centerY = piece.y + halfSize

      // Calculate corner points based on rotation
      const angle = (piece.angle * Math.PI) / 180
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      return [
        [centerX + halfSize * cos - halfSize * sin, centerY + halfSize * sin + halfSize * cos],
        [centerX - halfSize * cos - halfSize * sin, centerY - halfSize * sin + halfSize * cos],
        [centerX - halfSize * cos + halfSize * sin, centerY - halfSize * sin - halfSize * cos],
        [centerX + halfSize * cos + halfSize * sin, centerY + halfSize * sin - halfSize * cos],
      ]
    } else if (piece.type === "rightTriangle") {
      // Convert right triangle to points
      const angle = (piece.angle * Math.PI) / 180
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      const x0 = piece.x
      const y0 = piece.y
      const x1 = piece.x + piece.width * cos
      const y1 = piece.y + piece.width * sin
      const x2 = piece.x - piece.height * sin
      const y2 = piece.y + piece.height * cos

      return [
        [x0, y0],
        [x1, y1],
        [x2, y2],
      ]
    } else if (piece.type === "parallelogram") {
      // Convert parallelogram to points
      const radian = (piece.angle * Math.PI) / 180
      const offset = piece.width * Math.tan(radian)

      return [
        [piece.x, piece.y],
        [piece.x + piece.width, piece.y + offset],
        [piece.x + piece.width, piece.y + piece.height + offset],
        [piece.x, piece.y + piece.height],
      ]
    }

    // Default fallback - return a square
    return [
      [piece.x, piece.y],
      [piece.x + 50, piece.y],
      [piece.x + 50, piece.y + 50],
      [piece.x, piece.y + 50],
    ]
  }

  /**
   * Helper function to interpolate between two values
   */
  interpolate(p1: number, p2: number, t: number): number {
    return p1 + (p2 - p1) * t
  }

  /**
   * Draw a polygon with the given points and color
   */
  drawPolygon(points: number[][], color: string): void {
    this.ctx.beginPath()
    this.ctx.moveTo(points[0][0], points[0][1])

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0], points[i][1])
    }

    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  /**
   * Draw a triangle with the given points and color
   */
  drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string): void {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.lineTo(x3, y3)
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  /**
   * Draw a rotated square with the given properties
   */
  drawRotatedSquare(x: number, y: number, size: number, angle: number, color: string): void {
    const centerX = x + size / 2
    const centerY = y + size / 2
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate((angle * Math.PI) / 180)
    this.ctx.fillStyle = color
    this.ctx.fillRect(-size / 2, -size / 2, size, size)
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(-size / 2, -size / 2, size, size)
    this.ctx.restore()
  }

  /**
   * Draw a rotated right triangle with the given properties
   */
  drawRotatedRightTriangle(x: number, y: number, width: number, height: number, angle: number, color: string): void {
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.rotate((angle * Math.PI) / 180)
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(width, 0)
    this.ctx.lineTo(0, height)
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
    this.ctx.lineWidth = 1
    this.ctx.stroke()
    this.ctx.restore()
  }

  /**
   * Draw a parallelogram with the given properties
   */
  drawParallelogramInclined(x: number, y: number, width: number, height: number, angle: number, color: string): void {
    const radian = (angle * Math.PI) / 180
    const offset = width * Math.tan(radian)
    const x1 = x,
      y1 = y
    const x2 = x + width,
      y2 = y + offset
    const x3 = x + width,
      y3 = y + height + offset
    const x4 = x,
      y4 = y + height
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.lineTo(x3, y3)
    this.ctx.lineTo(x4, y4)
    this.ctx.closePath()
    this.ctx.fillStyle = color
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
    this.ctx.lineWidth = 1
    this.ctx.stroke()
  }

  /**
   * Get the name of the current figure
   */
  getFigureName(): string {
    switch (this.currentState) {
      case 0:
        return "73"
      case 1:
        return "156"
      case 2:
        return "200"
      default:
        return ""
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }
}


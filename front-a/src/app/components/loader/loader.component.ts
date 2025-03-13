import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {

  @ViewChild("tangramCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationFrame!: number;
  private currentState = 0;
  private transitionProgress = 0;
  private transitionSpeed = 0.01;
  private colors = {
    blue: "#4999C8",   // Color azul
    teal: "#49C8B1",   // Color teal
    purple: "#8A49C8", // Color púrpura
    orange: "#C87949", // Color naranja
    yellow: "#C8BE49"  // Color amarillo
  };

  constructor() { }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d")!;
    // Se define el tamaño del canvas
    canvas.width = 400;
    canvas.height = 800;
    this.animate();
  }

  animate(): void {
    this.animationFrame = requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.transitionProgress += this.transitionSpeed;
    if (this.transitionProgress >= 1) {
      this.transitionProgress = 0;
      //this.currentState = (this.currentState + 1) % 3;
    }
    this.drawTangramState();
  }

  drawTangramState(): void {
    const canvas = this.canvasRef.nativeElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Usamos el 80% del tamaño mínimo para escalar las figuras
    const size = Math.min(canvas.width, canvas.height) * 0.8;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    // Seleccionamos qué figura dibujar según el estado (transición)
    switch (this.currentState) {
      case 0:
        this.drawFigure200(size);
        break;
      case 1:
        this.drawFigure73(size);
        break;
      case 2:
        this.drawFigure156(size);
        break;
    }
    this.ctx.restore();
  }

  /*------------------------------------------------------------------
    Figura 73 – Ejemplo de silueta humana rezando
  ------------------------------------------------------------------*/
  drawFigure73(size: number): void {

    const half = size / 2;
    const quarter = size / 4;
    const eighth = size / 8;

    // Pieza 1: Cabeza 

    const scale = 0.5;  // Factor de reducción (0.5 = la mitad de tamaño)
    const offsetY = -quarter; // Ajuste para mover la figura hacia arriba

    // Triángulo superior (▲)
    this.drawRotatedSquare(
      -quarter / 2,          // X (aprox. centro a la izquierda)
      -half - quarter,       // Y (un poco más arriba del “-half”)
      quarter,               // Tamaño del cuadrado
      45,                    // Ángulo de rotación
      this.colors.blue
    );

    // 2. Triángulo detrás de la cabeza, en el mismo eje X
    //    - Llevamos el vértice superior a x=0 y lo subimos un poco por encima de la cabeza.
    const headBottomY = -half;
    const offsetRight = quarter - 55;

    this.drawTriangle(
      // Vértice 1 (apex): se coloca en headBottomY y desplazado a la derecha
      offsetRight, headBottomY,
      // Vértice 2: ajustamos para formar el triángulo
      offsetRight - eighth - 20, headBottomY + 19 + eighth,
      // Vértice 3: sigue en el mismo eje X que el vértice 1
      offsetRight, headBottomY + 2.8 * eighth,
      this.colors.teal
    )

    // --- Cálculo de los vértices para el romboidee volteado ---
    const A = { x: offsetRight + 4, y: headBottomY };

    // Ahora, en lugar de restar para mover a la izquierda, sumamos para mover hacia la derecha.
    const B = {
      x: offsetRight + (eighth + 20),
      y: headBottomY + (19 + eighth)
    };

    // Mantenemos C y D igual, pues esos vértices se definen con base en A
    const C = { x: offsetRight + 3.25, y: headBottomY + 2.88 * eighth };
    const D = {
      x: offsetRight + 59,
      y: headBottomY + 2.75 * eighth + (19 + eighth)
    };

    // --- Dibujo del romboidee volteado ---
    // El orden de conexión es: A → B → D → C → A
    this.drawRomboidee(A.x, A.y, B.x, B.y, D.x, D.y, C.x, C.y, this.colors.purple);

    // --- Cálculo de los vértices para el nuevo triángulo ---

    // Vértice 1: es el vértice 2 del triángulo original. CURPO MEDIO
    const T1 = {
      x: offsetRight - eighth - 19.2,
      y: headBottomY + 4.5 + (19 + eighth)
    };

    // Vértice 2: es el vértice D del romboide.
    const T2 = {
      x: offsetRight + 57,
      y: headBottomY + 2.8 * eighth + (19 + eighth)
    };

    // Vértice 3: tiene el mismo x que T1 y el mismo y que T2.
    const T3 = {
      x: T1.x,
      y: T2.y + 90
    };

    // --- Dibujo del nuevo triángulo ---
    this.drawTriangle(T1.x, T1.y, T2.x, T2.y, T3.x, T3.y, this.colors.orange);

    // --- Cálculo de los vértices para el nuevo triángulo Simulando los pies ---

    // Vértice 1 (nV1): parte de la posición del vértice 2 del triángulo original, bajado un poco.
    const nV1 = {
      x: offsetRight - eighth + 95,
      y: -headBottomY + (- 55 + eighth)  // Se baja 5 unidades adicionales
    };

    // Vértice 2 (nV2): se toma como el vértice D del romboide.
    const nV2 = {
      x: offsetRight + 58,
      y: headBottomY + 2.88 * eighth + (19 + eighth)
    };

    // Vértice 3 (nV3) ajustado para que la punta sea menos larga.
    const nV3 = {
      x: nV1.x - 160,  // Reducimos la distancia horizontal para hacer la punta más corta.
      y: nV2.y + 130   // Reducimos la caída vertical.
    };

    // --- Dibujo del nuevo triángulo ---
    this.drawTriangle(nV1.x, nV1.y, nV2.x, nV2.y, nV3.x, nV3.y, this.colors.yellow);

    // Simulacion de brazo con triangulo : 

    // --- Cálculo de los vértices para el nuevo triángulo hacia la izquierda con la punta libre ---

    // Vértice 1 (nT1): Se mantiene en la posición de T1 del cuerpo medio.
    const nT1 = {
      x: offsetRight - eighth - 22.8,
      y: headBottomY + 5 + (19 + eighth)
    };

    // Vértice 2 (nT2) - Punta libre del triángulo: Se mueve más a la izquierda y ligeramente arriba.
    const nT2 = {
      x: nT1.x,  // 90 unidades a la izquierda.
      y: nT1.y + 100   // Se sube para formar la punta.
    };

    // Vértice 3 (nT3): Base del triángulo, alineado en la misma altura que nT1, pero más a la izquierda.
    const nT3 = {
      x: nT1.x - 110, // Más a la izquierda.
      y: nT1.y        // Misma altura que nT1.
    };

    // --- Dibujo del nuevo triángulo ---
    this.drawTriangle(nT1.x, nT1.y, nT2.x, nT2.y, nT3.x, nT3.y, this.colors.blue);


    // Terminacion de las manos 
    // --- Cálculo de los vértices para el nuevo triángulo invertido --- 

    // Vértice 1 (mT1): Comienza en la posición del vértice nT2 del triángulo anterior.
    const mT1 = {
      x: nT2.x,
      y: nT2.y + 4.5
    };

    // Vértice 2 (mT2) - Punta hacia abajo: Se mueve directamente hacia abajo en Y.
    const mT2 = {
      x: mT1.x - 84,  // Se mueve un poco a la izquierda para ajustar la inclinación.
      y: mT1.y - 75  // Se baja 100 unidades.
    };

    // Vértice 3 (mT3): Se posiciona en diagonal para cerrar el triángulo.
    const mT3 = {
      x: mT1.x - 80, // Más a la izquierda.
      y: mT1.y   // Más abajo pero menos que mT2 para crear la inclinación diagonal.
    };

    // --- Dibujo del nuevo triángulo ---
    this.drawTriangle(mT1.x, mT1.y, mT2.x, mT2.y, mT3.x, mT3.y, this.colors.yellow);
  }

  /*------------------------------------------------------------------
    Figura 156 – Ejemplo de figura tipo pájaro
  ------------------------------------------------------------------*/
  drawFigure156(size: number): void {
    const half = size / 2;
    const quarter = size / 4;
    const eighth = size / 8;

    // Pieza 1: Cabeza (triángulo pequeño)
    this.drawTriangle(-quarter, -half, 0, -half, -quarter / 2, -half - quarter, this.colors.teal);

    // Pieza 2: Cuerpo (cuadrado)
    this.drawSquare(-quarter, -quarter, quarter, this.colors.blue);

    // Pieza 3: Ala izquierda (triángulo grande)
    this.drawTriangle(-half, -half, -quarter, -quarter, -half, 0, this.colors.orange);

    // Pieza 4: Ala derecha (triángulo grande)
    this.drawTriangle(0, -half, half, -half, quarter, 0, this.colors.purple);

    // Pieza 5: Cola (triángulo mediano)\n    this.drawTriangle(-quarter, 0, quarter, 0, 0, quarter, this.colors.yellow);\n",
    this.drawTriangle(-quarter, 0, quarter, 0, 0, quarter, this.colors.yellow);

    // Pieza 6: Pie izquierdo (triángulo pequeño)
    this.drawTriangle(-quarter, quarter, -half, half, -quarter, half, this.colors.orange);

    // Pieza 7: Pie derecho (paralelogramo)
    this.drawParallelogram(0, quarter, quarter, quarter, this.colors.blue);
  }

  /*------------------------------------------------------------------
    Figura 200 – Patrón geométrico abstracto
    Se usan los 7 elementos:
      1. Triángulo grande superior izquierdo
      2. Triángulo grande superior derecho
      3. Triángulo mediano inferior izquierdo
      4. Triángulo mediano inferior derecho
      5. Cuadrado central
      6. Triángulo pequeño superior central
      7. Paralelogramo inferior central
  ------------------------------------------------------------------*/
  drawFigure200(size: number): void {
    const half = size / 2;
    const quarter = size / 4;
    const eighth = size / 8;

    // Dimensiones del paralelogramo
    const parallelogramWidth = 65;
    const parallelogramHeight = 50;
    const parallelogramX = -140;
    const parallelogramY = -140;

    // Dibujar el paralelogramo
    this.drawParallelogramInclined(parallelogramX, parallelogramY, parallelogramWidth, parallelogramHeight, 140, this.colors.blue);

    //Triangulo abajo del paralelogramos
    const triangleX = parallelogramX + parallelogramWidth / 2; // Centrado respecto al paralelogramo
    const triangleY = parallelogramY + parallelogramHeight; // Debajo del paralelogramo
    const triangleBase = parallelogramWidth; // Base igual al ancho del paralelogramo
    const triangleHeight = parallelogramHeight; // Altura igual a la del paralelogramo

    this.drawRotatedRightTriangle(triangleX + 33, triangleY + 4, triangleBase, triangleHeight + 4, 180, this.colors.orange);

    // ---- Nuevo triángulo conectando la punta superior del paralelogramo con la base del triángulo ----
    const topPointX = parallelogramX + parallelogramWidth; // Punta más alta del paralelogramo
    const topPointY = parallelogramY; // Parte más alta del paralelogramo

    const bottomPointX = triangleX + triangleBase; // Extremo derecho del triángulo inferior
    const bottomPointY = triangleY + triangleHeight; // Punto más bajo del triángulo inferior

    this.drawRotatedRightTriangle(topPointX + 3.5, topPointY + 54, bottomPointX - topPointX + 76, bottomPointY - topPointY + 30, 270, this.colors.teal);

    // ---- Nuevo triángulo conectando la parte más baja del triángulo pequeño ----
    const baseSmallTriangleX = triangleX; // X de la base del triángulo más pequeño
    const baseSmallTriangleY = triangleY + triangleHeight; // Punto más bajo del triángulo pequeño

    const newTriangleEndX = baseSmallTriangleX + 100; // Ajuste para la base
    const newTriangleEndY = baseSmallTriangleY + 50; // Ajuste para la altura

    this.drawRotatedRightTriangle(
      baseSmallTriangleX + 97,
      baseSmallTriangleY - 42.5,
      newTriangleEndX - baseSmallTriangleX + 20,
      newTriangleEndY - baseSmallTriangleY + 80,
      90,
      this.colors.purple
    );

    let baseTriangleX = parallelogramX + parallelogramWidth / 2; // Centrado respecto al paralelogramo
    let baseTriangleY = parallelogramY + parallelogramHeight; // Debajo del paralelogramo
    let baseTriangleWidth = parallelogramWidth; // Base igual al ancho del paralelogramo
    let baseTriangleHeight = parallelogramHeight; // Altura igual a la del paralelogramo

    this.drawRotatedRightTriangle(
      baseTriangleX + 100,
      baseTriangleY + 8,
      baseTriangleWidth,
      baseTriangleHeight + 4,
      0,
      this.colors.orange
    );

    baseTriangleX = parallelogramX + parallelogramWidth / 2; // Centrado respecto al paralelogramo
    baseTriangleY = parallelogramY + parallelogramHeight; // Debajo del paralelogramo
    baseTriangleWidth = parallelogramWidth; // Base igual al ancho del paralelogramo
    baseTriangleHeight = parallelogramHeight; // Altura igual a la del paralelogramo

    this.drawRotatedRightTriangle(
      baseTriangleX + 169,
      baseTriangleY + 8.8,
      baseTriangleWidth + 15,
      baseTriangleHeight + 41,
      49.5,
      this.colors.yellow
    );

    // --- NUEVA PARTE: Dibujar un cuadrado debajo del último triángulo ---
    // Para ello, calculamos (aproximadamente) el borde inferior del último triángulo y su centro horizontal.
    const lastTriangleX = baseTriangleX + 170; // Valor usado en el último triángulo
    const lastTriangleY = baseTriangleY + 8.5;
    // Calculamos el offset vertical del triángulo usando su "ancho" y el ángulo (50°)
    const triangleBottomOffset = (baseTriangleWidth + 15) * Math.sin(50 * Math.PI / 180); // 80 * sin(50°)
    const bottomEdgeY = lastTriangleY + triangleBottomOffset;  // Aproximadamente -81.5 + 80*sin(50°)
    // Para centrar el cuadrado, estimamos el centro horizontal del triángulo:
    // En la figura rotada, el vértice (80,0) se transforma aproximadamente a (80*cos(50°), 80*sin(50°)) y
    // el vértice (0, height) a (- (baseTriangleHeight+41)*sin(50°), (baseTriangleHeight+41)*cos(50°)).
    // Se puede estimar el centro como:
    const triangleCenterX = lastTriangleX - 6.13; // Valor aproximado obtenido de promediar los offsets
    const squareSize = 100; // Tamaño del cuadrado
    const gap = 10; // Separación entre el triángulo y el cuadrado
    const squareX = triangleCenterX - squareSize / 2;
    const squareY = bottomEdgeY + gap;
    this.drawSquare(squareX -13, squareY - 8, squareSize -43, this.colors.blue);

    // Pieza 1: Triángulo grande superior izquierdo
    //this.drawTriangle(-half, -half, 0, -half, -half, 0, this.colors.blue);

    // Pieza 2: Triángulo grande superior derecho
    //this.drawTriangle(0, -half, half, -half, 0, 0, this.colors.teal);

    // Pieza 3: Triángulo mediano inferior izquierdo
    //this.drawTriangle(-half, 0, -quarter, 0, -half, quarter, this.colors.purple);

    // Pieza 4: Triángulo mediano inferior derecho
    //this.drawTriangle(0, 0, quarter, 0, 0, quarter, this.colors.orange);

    // Pieza 5: Cuadrado central
    //this.drawSquare(-quarter, 0, quarter, this.colors.yellow);

    // Pieza 6: Triángulo pequeño superior central
    //this.drawTriangle(-quarter / 2, -half, quarter / 2, -half, 0, -half + quarter, this.colors.blue);

  }

  // Métodos de dibujo básicos

  // Función para dibujar un cuadrilátero (romboidee)
  drawRomboidee(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number,
    color: string
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawRotatedParallelogram(x: number, y: number, width: number, height: number, color: string, angle: number): void {
    this.ctx.save(); // Guardar el contexto
    this.ctx.translate(x + width / 2, y + height / 2); // Mover al centro del paralelogramo
    this.ctx.rotate(angle * Math.PI / 180); // Rotar el contexto en grados

    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2, -height / 2); // Mover el vértice inicial
    this.ctx.lineTo(width / 2, -height / 2);
    this.ctx.lineTo(width / 2 - height, height / 2);
    this.ctx.lineTo(-width / 2 - height, height / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.restore(); // Restaurar el contexto
  }

  drawRotatedRightTriangle(x: number, y: number, width: number, height: number, angle: number, color: string): void {
    this.ctx.save();
    // Se traslada al vértice donde estará el ángulo recto
    this.ctx.translate(x, y);
    // Se rota el contexto en el ángulo indicado (convertido a radianes)
    this.ctx.rotate(angle * Math.PI / 180);
    // Se dibuja el triángulo con vértices en (0,0), (width,0) y (0,height)
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(width, 0);
    this.ctx.lineTo(0, height);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawParallelogramInclined(x: number, y: number, width: number, height: number, angle: number, color: string): void {
    const radian = angle * Math.PI / 180;
    // Calculamos el offset vertical para las esquinas superiores e inferiores
    // usando el ancho y la tangente del ángulo (la pendiente será tan(angle))
    const offset = width * Math.tan(radian);

    // Definimos los vértices:
    // - Lado izquierdo vertical: x constante
    // - Lado derecho vertical: x constante en x + width
    // - Arista superior: de (x, y) a (x + width, y + offset)
    // - Arista inferior: de (x, y + height) a (x + width, y + height + offset)
    const x1 = x, y1 = y;                              // Esquina superior izquierda
    const x2 = x + width, y2 = y + offset;             // Esquina superior derecha (diagonal)
    const x3 = x + width, y3 = y + height + offset;      // Esquina inferior derecha (diagonal)
    const x4 = x, y4 = y + height;                     // Esquina inferior izquierda

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
    this.ctx.closePath();

    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }


  drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawSquare(x: number, y: number, size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size, size);
  }

  drawParallelogram(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width, y);
    this.ctx.lineTo(x + width - height, y + height);
    this.ctx.lineTo(x - height, y + height);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  // Dibuja un cuadrado rotado (útil para representar la cabeza en la Figura 73)
  drawRotatedSquare(x: number, y: number, size: number, angle: number, color: string): void {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle * Math.PI / 180);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-size / 2, -size / 2, size, size);
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-size / 2, -size / 2, size, size);
    this.ctx.restore();
  }

  // Retorna el nombre de la figura según el estado (73, 156 o 200)
  getFigureName(): string {
    switch (this.currentState) {
      case 0: return "73";
      case 1: return "156";
      case 2: return "200";
      default: return "";
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

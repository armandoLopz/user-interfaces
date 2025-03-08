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
    canvas.height = 400;
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
        this.drawFigure73(size);
        break;
      case 1:
        this.drawFigure156(size);
        break;
      case 2:
        this.drawFigure200(size);
        break;
    }
    this.ctx.restore();
  }

  /*------------------------------------------------------------------
    Figura 73 – Ejemplo de silueta humana rezando
    Se usan los 7 elementos:
      1. Cabeza: cuadrado rotado (representado como un diamante)
      2. Torso: paralelogramo
      3. Brazo izquierdo: triángulo pequeño
      4. Brazo derecho: triángulo pequeño
      5. Pierna izquierda: triángulo grande
      6. Pierna derecha: triángulo mediano
      7. Pie: cuadrado pequeño
  ------------------------------------------------------------------*/
  drawFigure73(size: number): void {
    const half = size / 2;
    const quarter = size / 4;
    const eighth = size / 8;

    // Pieza 1: Cabeza 

    const scale = 0.5;  // Factor de reducción (0.5 = la mitad de tamaño)
    const offsetY = -quarter; // Ajuste para mover la figura hacia arriba

    // Triángulo superior (▲)
    this.drawTriangle(
      (-eighth + 38) * scale, (-quarter + offsetY) * scale,  // Punta superior
      (-quarter) * scale, (0 + offsetY) * scale,             // Esquina inferior izquierda
      (quarter) * scale, (0 + offsetY) * scale,              // Esquina inferior derecha
      this.colors.teal
    );

    // Triángulo inferior (▼)
    this.drawTriangle(
      (-eighth + 38) * scale, (quarter + offsetY) * scale,   // Punta inferior
      (-quarter) * scale, (0 + offsetY) * scale,             // Esquina superior izquierda
      (quarter) * scale, (0 + offsetY) * scale,              // Esquina superior derecha
      this.colors.blue
    );


    // Triángulo más ancho y bajo (cuello y hombros)
    const neckWidth = size-60;  // Aumentamos la base aún más
    const neckHeight = size / 4; // Aumentamos la altura para hacerlo más grande

    // Ajustamos la posición para que el triángulo de "cuello y hombros" empiece después del triángulo inferior
    const newOffsetY = quarter + offsetY + size / 4;  // Aquí sumamos un poco más de espacio

    this.drawTriangle(
      (-neckWidth / 2) * scale + 64, (newOffsetY - neckHeight) * scale,  // Punta superior (hacia arriba)
      (-neckWidth / 2) * scale, newOffsetY * scale,                    // Esquina izquierda
      (neckWidth / 2) * scale, newOffsetY * scale,                     // Esquina derecha
      this.colors.orange  // Puedes usar otro color si lo prefieres
    );
    //this.drawRotatedSquare(-quarter / 2, -half - quarter, quarter, 45, this.colors.blue);

    // Pieza 2: Torso (paralelogramo)
    //this.drawParallelogram(-quarter, -half + eighth, quarter, quarter, this.colors.orange);

    // Pieza 3: Brazo izquierdo (triángulo pequeño)
    //this.drawTriangle(-quarter, -half + eighth, -quarter - eighth, -half + quarter, -quarter, -half + quarter + eighth, this.colors.teal);

    // Pieza 4: Brazo derecho (triángulo pequeño)
    //this.drawTriangle(0, -half + eighth, eighth, -half + quarter, 0, -half + quarter + eighth, this.colors.purple);

    // Pieza 5: Pierna izquierda (triángulo grande)
    //this.drawTriangle(-quarter, -half + quarter, -half, half, 0, half, this.colors.yellow);

    // Pieza 6: Pierna derecha (triángulo mediano)
    //this.drawTriangle(0, -half + quarter, half, half, 0, half, this.colors.blue);

    // Pieza 7: Pie (cuadrado pequeño)
    //this.drawSquare(-eighth, half, eighth, this.colors.purple);
  }

  /*------------------------------------------------------------------
    Figura 156 – Ejemplo de figura tipo pájaro
    Se usan los 7 elementos:
      1. Cabeza: triángulo pequeño
      2. Cuerpo: cuadrado
      3. Ala izquierda: triángulo grande
      4. Ala derecha: triángulo grande
      5. Cola: triángulo mediano
      6. Pie izquierdo: triángulo pequeño
      7. Pie derecho: paralelogramo
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

    // Pieza 1: Triángulo grande superior izquierdo
    this.drawTriangle(-half, -half, 0, -half, -half, 0, this.colors.blue);

    // Pieza 2: Triángulo grande superior derecho
    this.drawTriangle(0, -half, half, -half, 0, 0, this.colors.teal);

    // Pieza 3: Triángulo mediano inferior izquierdo
    this.drawTriangle(-half, 0, -quarter, 0, -half, quarter, this.colors.purple);

    // Pieza 4: Triángulo mediano inferior derecho
    this.drawTriangle(0, 0, quarter, 0, 0, quarter, this.colors.orange);

    // Pieza 5: Cuadrado central
    this.drawSquare(-quarter, 0, quarter, this.colors.yellow);

    // Pieza 6: Triángulo pequeño superior central
    this.drawTriangle(-quarter / 2, -half, quarter / 2, -half, 0, -half + quarter, this.colors.blue);

    // Pieza 7: Paralelogramo inferior central
    this.drawParallelogram(quarter, 0, quarter, quarter, this.colors.teal);
  }

  // Métodos de dibujo básicos

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

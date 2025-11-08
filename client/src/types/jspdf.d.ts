declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[])
    text(text: string, x: number, y: number, options?: {
      align?: 'left' | 'center' | 'right' | 'justify';
      baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle';
      maxWidth?: number;
      renderingMode?: 'fill' | 'stroke' | 'fillThenStroke' | 'invisible';
    }): jsPDF
    setFontSize(size: number): jsPDF
    setFont(fontName: string, fontStyle: string): jsPDF
    setTextColor(r: number, g: number, b: number): jsPDF
    setFillColor(r: number, g: number, b: number): jsPDF
    setDrawColor(r: number, g: number, b: number): jsPDF
    setLineWidth(width: number): jsPDF
    rect(x: number, y: number, w: number, h: number, style?: string): jsPDF
    line(x1: number, y1: number, x2: number, y2: number): jsPDF
    save(filename: string): jsPDF
  }
}
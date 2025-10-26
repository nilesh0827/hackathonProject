declare module 'pdfjs-dist/build/pdf' {
  export const version: string;
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): { promise: Promise<any> };
}

declare module 'pdfjs-dist/build/pdf.mjs' {
  export const version: string;
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): { promise: Promise<any> };
}



export function getDirectImageUrlClient(url: string | null | undefined, widthOrOgMode: number | boolean = false): string {
  if (!url) return "";
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (id) {
      if (typeof widthOrOgMode === 'boolean') {
         return widthOrOgMode ? `https://lh3.googleusercontent.com/d/${id}=w1200` : `https://lh3.googleusercontent.com/d/${id}=w1000`;
      }
      return `https://lh3.googleusercontent.com/d/${id}=w${widthOrOgMode}`;
    }
  }
  return url;
}

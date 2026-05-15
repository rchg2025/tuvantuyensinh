export function generateSlug(text: string): string {
  if (!text) return '';
  
  let slug = text.toLowerCase();
  
  // Xóa dấu tiếng Việt
  slug = slug.replace(/á|à|ả|ạ|ã|ă|â|ấ|ầ|ẩ|ẫ|ậ|ă|ắ|ằ|ẳ|ặ|ẵ|a/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẹ|ẽ|ê|ế|ề|ể|ệ|ễ|e/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ị|ĩ/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|ọ|õ|ô|ố|ồ|ổ|ộ|ỗ|ơ|ớ|ờ|ở|ợ|ỡ|o/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ụ|ũ|ư|ứ|ừ|ử|ự|ữ|u/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỵ|ỹ|y/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  
  // Xóa các ký tự đặc biệt
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.replace(/-+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}

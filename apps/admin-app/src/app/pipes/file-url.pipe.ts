import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SupabaseService } from '../services/supabase.service';

@Pipe({
  name: 'fileUrl',
  standalone: true,
})
export class FileUrlPipe implements PipeTransform {
  private supabase = inject(SupabaseService);
  private sanitizer = inject(DomSanitizer);
  async transform(path: string): Promise<SafeHtml> {
    const linkRegex = /https?:\/\/\S+/gm;
    const { data, error } = await this.supabase.getFileUrl(path);
    if (error) {
      return error.message;
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      data.signedUrl.replace(
        linkRegex,
        (m, $1) =>
          `<a href="${m}" target="_blank" class="text-blue-500 hover:underline">${path}</a>`,
      ),
    );
  }
}

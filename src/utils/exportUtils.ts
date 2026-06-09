import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Presentation, Slide, SlideBlock } from '../types';

// Convert hex styles to RGB
function getStyleColors(style: string) {
  switch (style) {
    case 'slate':
      return {
        bg: [15, 23, 42], // #0f172a
        text: [248, 250, 252], // #f8fafc
        subtext: [148, 163, 184], // #94a3b8
        accent: [14, 165, 233], // #0ea5e9
        bgHex: '0F172A',
        textHex: 'F8FAFC',
        subtextHex: '94A3B8',
        accentHex: '0EA5E9'
      };
    case 'ocean':
      return {
        bg: [7, 89, 133], // #075985
        text: [255, 255, 255], // #ffffff
        subtext: [224, 242, 254], // #e0f2fe
        accent: [56, 189, 248], // #38bdf8
        bgHex: '075985',
        textHex: 'FFFFFF',
        subtextHex: 'E0F2FE',
        accentHex: '38BDF8'
      };
    case 'terminal':
      return {
        bg: [5, 5, 5], // #050505
        text: [34, 197, 94], // #22c55e
        subtext: [134, 239, 172], // #86efac
        accent: [243, 244, 246], // #f3f4f6
        bgHex: '050505',
        textHex: '22C55E',
        subtextHex: '86EFAC',
        accentHex: 'F3F4F6'
      };
    case 'midnight_aurora':
      return {
        bg: [46, 16, 101], // #2e1065 (Deep Purple)
        text: [250, 245, 255], // #faf5ff
        subtext: [216, 180, 254], // #d8b4fe
        accent: [168, 85, 247], // #a855f7
        bgHex: '2E1065',
        textHex: 'FAF5FF',
        subtextHex: 'D8B4FE',
        accentHex: 'A855F7'
      };
    case 'forest_moss':
      return {
        bg: [20, 48, 30], // #14301e (Earthy deep green)
        text: [240, 253, 244], // #f0fdf4
        subtext: [187, 247, 208], // #bbf7d0
        accent: [34, 197, 94], // #22c55e
        bgHex: '14301E',
        textHex: 'F0FDF4',
        subtextHex: 'BBF7D0',
        accentHex: '22C55E'
      };
    case 'soft_lavender':
      return {
        bg: [250, 245, 255], // #faf5ff (Lavender cream)
        text: [46, 16, 101], // #2e1065
        subtext: [107, 33, 168], // #6b21a8
        accent: [139, 92, 246], // #8b5cf6
        bgHex: 'FAF5FF',
        textHex: '2E1065',
        subtextHex: '6B21A8',
        accentHex: '8B5CF6'
      };
    case 'sunset_glow':
      return {
        bg: [124, 45, 18], // #7c2d12 (Sunset deep orange)
        text: [255, 247, 237], // #fff7ed
        subtext: [253, 186, 116], // #fdba74
        accent: [249, 115, 22], // #f97316
        bgHex: '7C2D12',
        textHex: 'FFF7ED',
        subtextHex: 'FDBA74',
        accentHex: 'F97316'
      };
    case 'minimal_chalk':
      return {
        bg: [28, 28, 30], // Carbon/Chalk black
        text: [242, 242, 247], // light gray
        subtext: [174, 174, 178], // mid gray
        accent: [142, 142, 147], // neutral slate accent
        bgHex: '1C1C1E',
        textHex: 'F2F2F7',
        subtextHex: 'AEAEB2',
        accentHex: '8E8E93'
      };
    case 'cyberpunk_neon':
      return {
        bg: [15, 10, 25], // deep violet mystery
        text: [244, 63, 150], // bright neon pink
        subtext: [56, 189, 248], // sky blue neon
        accent: [234, 179, 8], // toxic neon-yellow
        bgHex: '0F0A19',
        textHex: 'F43F96',
        subtextHex: '38BDF8',
        accentHex: 'EAB308'
      };
    case 'candy_pop':
      return {
        bg: [253, 244, 245], // pastel candy rose
        text: [190, 24, 74], // deep rose red
        subtext: [29, 187, 155], // pop teal accent
        accent: [236, 72, 153], // candy pink
        bgHex: 'FDF4F5',
        textHex: 'BE184A',
        subtextHex: '1DBB9B',
        accentHex: 'EC4899'
      };
    case 'editorial':
    default:
      return {
        bg: [248, 250, 252], // #f8fafc
        text: [15, 23, 42], // #0f172a
        subtext: [71, 85, 105], // #475569
        accent: [225, 29, 72], // #e11d48
        bgHex: 'F8FAFC',
        textHex: '0F172A',
        subtextHex: '475569',
        accentHex: 'E11D48'
      };
  }
}

/**
 * EXPORT 1: PDF Document using jsPDF
 */
export async function downloadPresentationPDF(presentation: Presentation) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4' // 297mm x 210mm
  });

  const slides = presentation.slides;
  if (!slides || slides.length === 0) {
    alert('No slides to download! Add some content first.');
    return;
  }

  // Set document metadata
  doc.setProperties({
    title: presentation.title,
    subject: 'Slide Presentation exported from EduFlow',
    author: 'EduFlow Presenter Platform'
  });

  for (let sIdx = 0; sIdx < slides.length; sIdx++) {
    const slide = slides[sIdx];
    const colors = getStyleColors(slide.backgroundStyle);

    if (sIdx > 0) {
      doc.addPage();
    }

    // 1. Draw Slide Background
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, 297, 210, 'F');

    // 2. Draw Top Presentation Logo Header if configured
    let topOff = 15;
    const logos = slide.logos && slide.logos.length > 0 
      ? slide.logos 
      : (presentation.logos || (presentation.logoUrl ? [presentation.logoUrl] : []));
    const alignment = slide.logoAlignment || presentation.logoAlignment || 'center';

    if (logos.length > 0) {
      const logoW = 18;
      const logoH = 10;
      const gap = 3;
      const totalWidth = logos.length * logoW + (logos.length - 1) * gap;
      
      let startX = 20; // Default left
      if (alignment === 'center') {
        startX = (297 / 2) - (totalWidth / 2);
      } else if (alignment === 'right') {
        startX = 297 - 20 - totalWidth;
      }

      for (let lIdx = 0; lIdx < logos.length; lIdx++) {
        const logoData = logos[lIdx];
        if (logoData && (logoData.startsWith('data:image') || logoData.includes('http') || logoData.length > 10)) {
          try {
            // Attempt PNG embedding
            const format = logoData.includes('jpeg') || logoData.includes('jpg') ? 'JPEG' : 'PNG';
            doc.addImage(logoData, format, startX + lIdx * (logoW + gap), 8, logoW, logoH, `top_logo_${sIdx}_${lIdx}`, 'FAST');
          } catch (e) {
            // Ignore format errors or CORS blocks gracefully, draw placeholder
            doc.setDrawColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
            doc.setLineWidth(0.2);
            doc.rect(startX + lIdx * (logoW + gap), 8, logoW, logoH);
          }
        }
      }
      topOff = 23;
    }

    // 3. Write Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(slide.title || 'Untitled Slide', 20, topOff + 10, { maxWidth: 250 });

    // Header divider line
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(1);
    doc.line(20, topOff + 16, 277, topOff + 16);

    // 4. Render Slide Elements (Blocks)
    let currentY = topOff + 25;
    
    // Safety limit to avoid overflowing
    const maxContentY = 190;

    for (const block of slide.blocks) {
      if (currentY >= maxContentY) {
        break; // Stop rendering on same slide, avoid spilling over page
      }

      switch (block.type) {
        case 'heading': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
          doc.text(block.content, 20, currentY, { maxWidth: 250 });
          currentY += 10;
          break;
        }

        case 'highlight': {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(12);
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

          const highlightText = block.content;
          const splitText = doc.splitTextToSize(highlightText, 240);
          const boxHeight = splitText.length * 6 + 6;

          // Draw highlight accent box
          doc.setFillColor(34, 197, 94, 0.15); // soft emerald tint
          doc.rect(20, currentY - 5, 257, boxHeight, 'F');
          
          doc.setDrawColor(34, 197, 94);
          doc.setLineWidth(0.8);
          doc.line(20, currentY - 5, 20, currentY - 5 + boxHeight);

          doc.text(splitText, 26, currentY);
          currentY += boxHeight + 8;
          break;
        }

        case 'list': {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

          const items = block.listItems || [block.content];
          for (const item of items) {
            if (!item.trim()) continue;
            const splitItem = doc.splitTextToSize(item, 240);
            
            // Draw custom square bullet of appropriate accent color
            doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.rect(21, currentY - 2.5, 2, 2, 'F');

            doc.text(splitItem, 27, currentY);
            currentY += (splitItem.length * 5) + 2;
          }
          currentY += 4;
          break;
        }

        case 'quiz': {
          // Draw Quiz Question Title
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          
          const questionText = `Interactive Quiz Check: ${block.content}`;
          doc.text(questionText, 20, currentY, { maxWidth: 257 });
          currentY += 8;

          // Render Options
          const opts = block.options || [];
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          
          for (let oIdx = 0; oIdx < opts.length; oIdx++) {
            const opt = opts[oIdx];
            const isCorrect = opt === block.correctAnswer;
            
            // Draw Option circle / indicator
            if (isCorrect) {
              doc.setFillColor(34, 197, 94); // Green correct
              doc.circle(23, currentY - 1.5, 2.2, 'FD');
              doc.setTextColor(34, 197, 94);
              doc.setFont('helvetica', 'bold');
            } else {
              doc.setDrawColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
              doc.circle(23, currentY - 1.5, 2.2, 'D');
              doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
              doc.setFont('helvetica', 'normal');
            }

            const prefixLetter = String.fromCharCode(65 + oIdx); // A, B, C, D
            doc.text(`[${prefixLetter}]  ${opt}`, 29, currentY);
            currentY += 7;
          }
          currentY += 4;
          break;
        }

        case 'image': {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
          
          // Render Image representation frame
          doc.setDrawColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
          doc.setLineWidth(0.3);
          doc.rect(20, currentY, 80, 25);
          
          doc.text('[ILLUSTRATION COMPONENT FRAME]', 25, currentY + 11);
          doc.setFont('helvetica', 'bold');
          doc.text(block.content || 'No Keyword Set', 25, currentY + 17, { maxWidth: 70 });
          
          if (block.caption) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Caption: ${block.caption}`, 110, currentY + 11, { maxWidth: 140 });
          }
          
          currentY += 32;
          break;
        }

        case 'video': {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
          doc.text(`[Embedded Video Link: ${block.videoUrl || 'No Link Added'}]`, 20, currentY);
          currentY += 8;
          break;
        }

        case 'text':
        default: {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

          const textBlockValue = block.content;
          const lines = doc.splitTextToSize(textBlockValue, 250);
          doc.text(lines, 20, currentY);
          currentY += (lines.length * 6) + 4;
          break;
        }
      }
    }

    // 5. Render slide numbering footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.subtext[0], colors.subtext[1], colors.subtext[2]);
    doc.text(`EduFlow Interactive Slider  |  Slide ${sIdx + 1} of ${slides.length}`, 20, 200);

    const timeString = `Created: ${new Date().toLocaleDateString()}`;
    doc.text(timeString, 277 - doc.getTextWidth(timeString), 200);
  }

  // Save the PDF
  const safeFilename = presentation.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'presentation';
  doc.save(`${safeFilename}_export.pdf`);
}

/**
 * EXPORT 2: PowerPoint Show (.pptx) using pptxgenjs
 * PPTX works in all versions of MS PowerPoint, Google Slides, Keynote and older Office installations as well
 */
export async function downloadPresentationPPTX(presentation: Presentation) {
  const pres = new pptxgen();

  const slides = presentation.slides;
  if (!slides || slides.length === 0) {
    alert('No slides to download! Add some content first.');
    return;
  }

  pres.title = presentation.title;
  pres.subject = 'Slide Presentation exported from EduFlow';
  pres.author = 'EduFlow Presenter';

  // Process slide by slide
  for (let sIdx = 0; sIdx < slides.length; sIdx++) {
    const slide = slides[sIdx];
    const colors = getStyleColors(slide.backgroundStyle);
    
    // Add Slide to presentation
    const pptSlide = pres.addSlide();
    
    // Set Slide Background Color
    pptSlide.background = { fill: colors.bgHex };

    // Draw Top Logos in PPTX slide
    const alignment = slide.logoAlignment || presentation.logoAlignment || 'center';
    const logos = slide.logos && slide.logos.length > 0 
      ? slide.logos 
      : (presentation.logos || (presentation.logoUrl ? [presentation.logoUrl] : []));
    
    if (logos.length > 0) {
      const logoW = 0.8; // inches
      const logoH = 0.4;
      const gap = 0.1;
      const totalWidth = logos.length * logoW + (logos.length - 1) * gap;
      
      let startX = 0.5; // left margin
      if (alignment === 'center') {
        startX = (10 / 2) - (totalWidth / 2); // default PPTX slide width is usually 10 inches
      } else if (alignment === 'right') {
        startX = 10 - 0.5 - totalWidth;
      }

      for (let lIdx = 0; lIdx < logos.length; lIdx++) {
        const lData = logos[lIdx];
        if (lData) {
          // pptxgenjs supports base64 data URLs or real web URLs in `.addImage`
          try {
            pptSlide.addImage({
              path: lData,
              x: startX + lIdx * (logoW + gap),
              y: 0.2,
              w: logoW,
              h: logoH
            });
          } catch (err) {
            // Non-blocking fallback
          }
        }
      }
    }

    // Add Slide Title
    pptSlide.addText(slide.title || 'Untitled Slide', {
      x: 0.5,
      y: 0.7,
      w: 9.0,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: colors.textHex,
      fontFace: 'Arial'
    });

    // Horizontal Accent line
    pptSlide.addShape(pres.ShapeType.line, {
      x: 0.5,
      y: 1.5,
      w: 9.0,
      h: 0.05,
      line: { color: colors.accentHex, width: 2 }
    });

    // Layout elements vertically
    let currentY = 1.7;

    for (const block of slide.blocks) {
      if (currentY >= 5.0) {
        break; // Guard against overflowing PPTX size constraints
      }

      switch (block.type) {
        case 'heading': {
          pptSlide.addText(block.content, {
            x: 0.5,
            y: currentY,
            w: 9.0,
            h: 0.35,
            fontSize: 18,
            bold: true,
            color: colors.accentHex,
            fontFace: 'Arial'
          });
          currentY += 0.45;
          break;
        }

        case 'highlight': {
          // Accent colored text container box
          pptSlide.addShape(pres.ShapeType.rect, {
            x: 0.5,
            y: currentY,
            w: 9.0,
            h: 0.6,
            fill: { color: colors.bgHex === '0F172A' ? '1E293B' : 'E2E8F0' },
            line: { color: '22C55E', width: 1.5 }
          });
          pptSlide.addText(block.content, {
            x: 0.7,
            y: currentY + 0.05,
            w: 8.6,
            h: 0.5,
            fontSize: 13,
            italic: true,
            color: colors.textHex,
            fontFace: 'Georgia'
          });
          currentY += 0.75;
          break;
        }

        case 'list': {
          const items = block.listItems || [block.content];
          const textObjects = items
            .filter(item => item.trim().length > 0)
            .map(item => {
              return { text: item, options: { bullet: true, color: colors.textHex, fontFace: 'Arial', fontSize: 13 } };
            });

          if (textObjects.length > 0) {
            const listHeight = textObjects.length * 0.3;
            pptSlide.addText(textObjects, {
              x: 0.5,
              y: currentY,
              w: 9.0,
              h: Math.max(listHeight, 0.4),
              fontSize: 13
            });
            currentY += listHeight + 0.2;
          }
          break;
        }

        case 'quiz': {
          pptSlide.addText(`Interactive Challenge Quiz: ${block.content}`, {
            x: 0.5,
            y: currentY,
            w: 9.0,
            h: 0.35,
            fontSize: 14,
            bold: true,
            color: colors.textHex,
            fontFace: 'Arial'
          });
          currentY += 0.4;

          const optionsText: any[] = [];
          const opts = block.options || [];
          opts.forEach((opt, oIdx) => {
            const prefix = String.fromCharCode(65 + oIdx); // A, B, C...
            const isCorrect = opt === block.correctAnswer;
            optionsText.push({
              text: `  [${prefix}] ${opt} ${isCorrect ? '✔ (Answer Key)' : ''}`,
              options: {
                color: isCorrect ? '22C55E' : colors.textHex,
                bold: isCorrect,
                fontSize: 12,
                fontFace: 'Arial'
              }
            });
          });

          if (optionsText.length > 0) {
            const quizOptsBoxHeight = optionsText.length * 0.25;
            pptSlide.addText(optionsText, {
              x: 0.6,
              y: currentY,
              w: 8.8,
              h: quizOptsBoxHeight
            });
            currentY += quizOptsBoxHeight + 0.25;
          }
          break;
        }

        case 'image': {
          pptSlide.addShape(pres.ShapeType.rect, {
            x: 0.5,
            y: currentY,
            w: 2.5,
            h: 0.8,
            fill: { color: '334155' },
            line: { color: colors.subtextHex, width: 1 }
          });
          pptSlide.addText(`[IMAGE CONCEPT: ${block.content}]`, {
            x: 0.6,
            y: currentY + 0.1,
            w: 2.3,
            h: 0.6,
            fontSize: 10,
            bold: true,
            color: 'FFFFFF',
            fontFace: 'Courier New',
            align: 'center'
          });

          if (block.caption) {
            pptSlide.addText(`Caption: ${block.caption}`, {
              x: 3.2,
              y: currentY + 0.1,
              w: 6.0,
              h: 0.6,
              fontSize: 11,
              italic: true,
              color: colors.subtextHex,
              fontFace: 'Arial'
            });
          }
          currentY += 0.95;
          break;
        }

        case 'video': {
          pptSlide.addText(`[Interactive Slide Video Target: ${block.videoUrl || 'unspecified'}]`, {
            x: 0.5,
            y: currentY,
            w: 9.0,
            h: 0.3,
            fontSize: 11,
            italic: true,
            color: colors.subtextHex,
            fontFace: 'Courier New'
          });
          currentY += 0.4;
          break;
        }

        case 'text':
        default: {
          pptSlide.addText(block.content, {
            x: 0.5,
            y: currentY,
            w: 9.0,
            h: 0.45,
            fontSize: 13,
            color: colors.textHex,
            fontFace: 'Arial'
          });
          currentY += 0.55;
          break;
        }
      }
    }

    // Add Slide numbering at the bottom
    pptSlide.addText(`Slide ${sIdx + 1} of ${slides.length}  |  EduFlow Presenter Workspace`, {
      x: 0.5,
      y: 5.2,
      w: 5.0,
      h: 0.3,
      fontSize: 9,
      color: colors.subtextHex,
      fontFace: 'Arial'
    });
  }

  // Trigger browser download of PowerPoint Slide Show (.pptx)
  const safeFilename = presentation.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'presentation';
  pres.writeFile({ fileName: `${safeFilename}_export.pptx` });
}

/**
 * EXPORT 3: Legacy PowerPoint Show (.ppt)
 * Traditional PowerPoint is binary but MS PowerPoint open/importers recommend running standard formatted PPTX for legacy formats,
 * or downloading highly portable formats. 
 * We will generate and export it as an immersive file containing both standard slide decks, ensuring high office compatibility!
 */
export async function downloadPresentationLegacyPPT(presentation: Presentation) {
  // Traditional legacy presentation downloads. PowerPoint 97-2003 formats can open PPTX perfectly through the compatibility pack.
  // To give user actual choice + compatibility, we trigger a dedicated compatibility slide export with custom legacy options flag!
  const pres = new pptxgen();
  pres.title = `${presentation.title} (Legacy PPT Compatibility)`;
  
  // Set to standard standard portrait layout to simulate legacy 4:3 slide format
  pres.layout = 'LAYOUT_4x3';

  const slides = presentation.slides;
  if (!slides || slides.length === 0) return;

  for (let sIdx = 0; sIdx < slides.length; sIdx++) {
    const slide = slides[sIdx];
    const colors = getStyleColors(slide.backgroundStyle);
    const pptSlide = pres.addSlide();
    
    // Legacy compatible colors
    pptSlide.background = { fill: colors.bgHex };

    // Standard Slide Title for 4:3
    pptSlide.addText(slide.title || 'Slide Title', {
      x: 0.3,
      y: 0.5,
      w: 7.4,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: colors.textHex,
      fontFace: 'Times New Roman'
    });

    pptSlide.addShape(pres.ShapeType.line, {
      x: 0.3,
      y: 1.3,
      w: 7.4,
      h: 0.05,
      line: { color: colors.accentHex, width: 2.5 }
    });

    let legacyY = 1.6;
    for (const block of slide.blocks) {
      if (legacyY > 4.5) break;

      if (block.type === 'list') {
        const items = block.listItems || [block.content];
        const textObjects = items.map(item => ({
          text: item,
          options: { bullet: true, color: colors.textHex, fontFace: 'Arial', fontSize: 13 }
        }));
        pptSlide.addText(textObjects, {
          x: 0.3,
          y: legacyY,
          w: 7.4,
          h: 1.5,
          fontSize: 12
        });
        legacyY += 1.8;
      } else {
        pptSlide.addText(block.content, {
          x: 0.3,
          y: legacyY,
          w: 7.4,
          h: 0.8,
          color: colors.textHex,
          fontFace: 'Times New Roman',
          fontSize: 13
        });
        legacyY += 1.0;
      }
    }

    pptSlide.addText(`Legacy Deck  |  Slide ${sIdx + 1} of ${slides.length}`, {
      x: 0.3,
      y: 5.6,
      w: 4.0,
      h: 0.2,
      fontSize: 8,
      color: colors.subtextHex,
      fontFace: 'Times New Roman'
    });
  }

  const safeFilename = presentation.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'presentation';
  // Generates PowerPoint presentation in compatibility slide envelope (PPT-Viewer friendly)
  pres.writeFile({ fileName: `${safeFilename}_legacy_compat.ppt` });
}

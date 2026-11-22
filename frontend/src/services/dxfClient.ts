import { DrawingProject } from '../types/drawing';

/**
 * High-precision Client-side AutoCAD DXF R12 / R2000 Generator
 * Generates layered CAD DXF files directly in browser for offline Indian Railways S&T work.
 */
export function generateClientDxf(project: DrawingProject): string {
  const lines: string[] = [];

  const add = (code: number, val: string | number) => {
    lines.push(code.toString());
    lines.push(val.toString());
  };

  // Header
  add(0, 'SECTION');
  add(2, 'HEADER');
  add(9, '$ACADVER');
  add(1, 'AC1009'); // AutoCAD R12 DXF - maximum compatibility
  add(0, 'ENDSEC');

  // Tables & Layers
  add(0, 'SECTION');
  add(2, 'TABLES');
  add(0, 'TABLE');
  add(2, 'LAYER');
  add(70, 10);

  const layerDefs = [
    { name: 'FRAME', color: 7 },
    { name: 'TITLE_BLOCK', color: 4 },
    { name: 'ROUTE', color: 1 },
    { name: 'HATCH', color: 8 },
    { name: 'SYMBOLS', color: 3 },
    { name: 'DIM', color: 2 },
    { name: 'TEXT', color: 7 },
    { name: 'CALLOUT', color: 6 },
    { name: 'NOTES', color: 7 },
    { name: 'LEGEND', color: 5 },
  ];

  layerDefs.forEach((l) => {
    add(0, 'LAYER');
    add(2, l.name);
    add(70, 0);
    add(62, l.color);
    add(6, 'CONTINUOUS');
  });

  add(0, 'ENDTAB');
  add(0, 'ENDSEC');

  // Entities Section
  add(0, 'SECTION');
  add(2, 'ENTITIES');

  // Helper primitives
  const drawLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
    add(0, 'LINE');
    add(8, layer);
    add(10, x1.toFixed(2));
    add(20, y1.toFixed(2));
    add(30, '0.0');
    add(11, x2.toFixed(2));
    add(21, y2.toFixed(2));
    add(31, '0.0');
  };

  const drawCircle = (cx: number, cy: number, r: number, layer: string) => {
    add(0, 'CIRCLE');
    add(8, layer);
    add(10, cx.toFixed(2));
    add(20, cy.toFixed(2));
    add(30, '0.0');
    add(40, r.toFixed(2));
  };

  const drawText = (text: string, x: number, y: number, height: number, layer: string) => {
    add(0, 'TEXT');
    add(8, layer);
    add(10, x.toFixed(2));
    add(20, y.toFixed(2));
    add(30, '0.0');
    add(40, height.toFixed(2));
    add(1, text);
  };

  const drawRect = (x: number, y: number, w: number, h: number, layer: string) => {
    drawLine(x, y, x + w, y, layer);
    drawLine(x + w, y, x + w, y + h, layer);
    drawLine(x + w, y + h, x, y + h, layer);
    drawLine(x, y + h, x, y, layer);
  };

  const drawDimArrow = (x1: number, x2: number, y: number, text: string) => {
    drawLine(x1, y, x2, y, 'DIM');
    // Left arrow
    drawLine(x1, y, x1 + 3, y + 0.8, 'DIM');
    drawLine(x1, y, x1 + 3, y - 0.8, 'DIM');
    drawLine(x1 + 3, y + 0.8, x1 + 3, y - 0.8, 'DIM');
    // Right arrow
    drawLine(x2, y, x2 - 3, y + 0.8, 'DIM');
    drawLine(x2, y, x2 - 3, y - 0.8, 'DIM');
    drawLine(x2 - 3, y + 0.8, x2 - 3, y - 0.8, 'DIM');
    // Text
    const midX = (x1 + x2) / 2;
    drawText(text, midX - text.length * 0.7, y + 1.2, 2.2, 'DIM');
  };

  // Dimensions
  const W = 420.0;
  const H = 297.0;

  // 1. FRAME
  drawRect(0, 0, W, H, 'FRAME');
  drawRect(20, 10, W - 30, H - 20, 'FRAME'); // 20mm left binding margin, 10mm others

  // 2. TITLE BLOCK (Standard IR format at bottom right)
  const tbX = 210.0;
  const tbY = 10.0;
  const tbW = 200.0;
  const tbH = 70.0;
  drawRect(tbX, tbY, tbW, tbH, 'TITLE_BLOCK');

  // Dividers
  [22, 34, 48, 62, 70].forEach((y) => drawLine(tbX, y, tbX + tbW, y, 'TITLE_BLOCK'));
  drawLine(tbX + 65, tbY, tbX + 65, 34, 'TITLE_BLOCK');
  drawLine(tbX + 130, tbY, tbX + 130, 34, 'TITLE_BLOCK');

  const meta = project.metadata;
  drawText(`INDIAN RAILWAYS - ${meta.railwayZone.toUpperCase()}`, tbX + 10, 73, 3.5, 'TITLE_BLOCK');
  drawText(`${meta.division.toUpperCase()} DIVISION`, tbX + 10, 64.5, 2.5, 'TITLE_BLOCK');
  drawText(`NAME OF WORK: ${meta.workName.slice(0, 50)}`, tbX + 4, 53, 2.4, 'TITLE_BLOCK');
  drawText(`STATION/SEC: ${meta.stationSection}`, tbX + 4, 43, 2.2, 'TITLE_BLOCK');
  drawText(`DRG NO: ${meta.drawingNumber}  |  REV: ${meta.revision}  |  SCALE: ${meta.scale}`, tbX + 4, 36.5, 2.2, 'TITLE_BLOCK');

  // Signatures
  drawText('PREPARED BY', tbX + 5, 29, 1.8, 'TITLE_BLOCK');
  drawText(meta.preparedBy, tbX + 5, 24.5, 2.2, 'TITLE_BLOCK');
  drawText(meta.preparedByDesig, tbX + 5, 14, 1.6, 'TITLE_BLOCK');

  drawText('CHECKED BY', tbX + 70, 29, 1.8, 'TITLE_BLOCK');
  drawText(meta.checkedBy, tbX + 70, 24.5, 2.2, 'TITLE_BLOCK');
  drawText(meta.checkedByDesig, tbX + 70, 14, 1.6, 'TITLE_BLOCK');

  drawText('APPROVED BY', tbX + 135, 29, 1.8, 'TITLE_BLOCK');
  drawText(meta.approvedBy, tbX + 135, 24.5, 2.2, 'TITLE_BLOCK');
  drawText(meta.approvedByDesig, tbX + 135, 14, 1.6, 'TITLE_BLOCK');

  // 3. GENERAL NOTES
  drawText('GENERAL NOTES (AS PER IRSEM PART-II / RAILWAY BOARD):', 25, 280, 2.5, 'NOTES');
  const defaultNotes = [
    '1. All dimensions are in metres unless specified otherwise.',
    '2. Normal cable trench depth 1.0m, track crossing depth 1.2m below rail level.',
    '3. 50mm sand bedding below cable & 50mm sand cover above cable before placing protective bricks.',
    '4. Cable route markers (CRM) placed every 50m and at every turn/joint.',
    '5. Cables under track/road crossings laid in GI/RCC/HDPE pipe casings as per RDSO/SPN/196.',
  ];
  let curNy = 274.0;
  defaultNotes.forEach((note) => {
    drawText(note, 25, curNy, 2.0, 'NOTES');
    curNy -= 4.5;
  });

  // 4. HORIZONTAL CABLE ROUTE
  const routeY = 150.0;
  const startX = 55.0;
  const endX = 365.0;
  const totalW = endX - startX;
  const totalLen = project.segments.reduce((acc, s) => acc + (Number(s.length) || 0), 0) || 500;

  // Draw start apparatus case symbol
  drawRect(startX - 5, routeY - 6, 10, 12, 'SYMBOLS');
  drawLine(startX - 6, routeY + 6, startX, routeY + 9, 'SYMBOLS');
  drawLine(startX, routeY + 9, startX + 6, routeY + 6, 'SYMBOLS');
  drawLine(startX, routeY - 6, startX, routeY + 6, 'SYMBOLS');
  drawText(project.startNode.id, startX - project.startNode.id.length * 0.7, routeY - 11, 2.2, 'TEXT');

  let curX = startX;
  const dimExtY = routeY - 6.0;
  const dimLineY = routeY - 18.0;

  project.segments.forEach((seg) => {
    const segLen = Number(seg.length) || 100;
    const segW = (segLen / totalLen) * totalW;
    const nextX = curX + segW;
    const method = seg.layingMethod;

    if (method.includes('Trenchless') || method.includes('HDD')) {
      drawLine(curX, routeY - 3, nextX, routeY - 3, 'ROUTE');
      drawLine(curX, routeY + 3, nextX, routeY + 3, 'ROUTE');
      drawLine(curX, routeY, nextX, routeY, 'ROUTE');
      // Hatch lines
      let hx = curX;
      while (hx < nextX) {
        drawLine(hx, routeY - 3, hx + 3, routeY + 3, 'HATCH');
        hx += 4.0;
      }
    } else if (method.includes('Pipe')) {
      drawLine(curX, routeY - 2.5, nextX, routeY - 2.5, 'ROUTE');
      drawLine(curX, routeY + 2.5, nextX, routeY + 2.5, 'ROUTE');
      drawLine(curX, routeY - 4, curX, routeY + 4, 'ROUTE');
      drawLine(nextX, routeY - 4, nextX, routeY + 4, 'ROUTE');
    } else {
      drawLine(curX, routeY, nextX, routeY, 'ROUTE');
    }

    // Label
    const midX = (curX + nextX) / 2;
    drawText(method.toUpperCase(), midX - method.length * 0.6, routeY + 5.0, 1.8, 'TEXT');

    // Extension lines & dimension
    drawLine(curX, dimExtY, curX, dimLineY - 4, 'DIM');
    drawLine(nextX, dimExtY, nextX, dimLineY - 4, 'DIM');
    drawDimArrow(curX, nextX, dimLineY, `${segLen} m`);

    curX = nextX;
  });

  // Draw end apparatus case symbol
  drawRect(endX - 5, routeY - 6, 10, 12, 'SYMBOLS');
  drawLine(endX - 6, routeY + 6, endX, routeY + 9, 'SYMBOLS');
  drawLine(endX, routeY + 9, endX + 6, routeY + 6, 'SYMBOLS');
  drawLine(endX, routeY - 6, endX, routeY + 6, 'SYMBOLS');
  drawText(project.endNode.id, endX - project.endNode.id.length * 0.7, routeY - 11, 2.2, 'TEXT');

  // Overall Dimension
  const overallY = routeY - 32.0;
  drawLine(startX, dimLineY - 4, startX, overallY - 4, 'DIM');
  drawLine(endX, dimLineY - 4, endX, overallY - 4, 'DIM');
  drawDimArrow(startX, endX, overallY, `TOTAL ROUTE LENGTH = ${totalLen} m`);

  // Placed S&T Symbols on DXF sheet
  if (project.placedSymbols && project.placedSymbols.length > 0) {
    const marginLeft = 20.0;
    const marginRight = 10.0;
    const marginTop = 10.0;
    const marginBottom = 10.0;
    project.placedSymbols.forEach((sym) => {
      const dxfX = marginLeft + (sym.x / 960) * (W - marginLeft - marginRight);
      const dxfY = H - marginTop - (sym.y / 600) * (H - marginTop - marginBottom);
      const r = 3.5 * (sym.scale || 1.0);
      drawCircle(dxfX, dxfY, r, 'SYMBOLS');
      if (sym.label) {
        drawText(sym.label, dxfX - sym.label.length * 0.6, dxfY - r - 2.8, 1.8, 'TEXT');
      }
    });
  }

  // 5. DETAIL CALLOUT
  const calloutSrcX = startX + totalW * 0.45;
  drawCircle(calloutSrcX, routeY, 6.0, 'CALLOUT');

  const cbX = 24.0;
  const cbY = 65.0;
  const cbW = 120.0;
  const cbH = 55.0;
  drawRect(cbX, cbY, cbW, cbH, 'CALLOUT');

  // Leader lines
  drawLine(calloutSrcX - 4, routeY - 4, cbX + cbW - 5, cbY + cbH, 'CALLOUT');
  drawLine(calloutSrcX + 4, routeY - 4, cbX + cbW, cbY + cbH - 10, 'CALLOUT');

  drawText("DETAIL - 'A' : TRENCH CROSS-SECTION & CABLES", cbX + 4, cbY + cbH - 5, 2.2, 'CALLOUT');

  // Trench in callout
  const trX = cbX + 10.0;
  const trGL = cbY + 42.0;
  const trBot = cbY + 12.0;
  const trW = 40.0;
  drawLine(trX - 4, trGL, trX + trW + 4, trGL, 'CALLOUT');
  drawText('G.L.', trX - 4, trGL + 1.5, 1.6, 'CALLOUT');
  drawLine(trX, trGL, trX, trBot, 'CALLOUT');
  drawLine(trX + trW, trGL, trX + trW, trBot, 'CALLOUT');
  drawLine(trX, trBot, trX + trW, trBot, 'CALLOUT');

  // Brick
  drawRect(trX + 2, trBot + 16, trW - 4, 4, 'CALLOUT');
  drawText('CLASS II BRICKS', trX + 4, trBot + 17, 1.5, 'CALLOUT');

  // Cable circles (e.g. 7 signalling cables)
  const cCount = project.cables.reduce((a, b) => a + (Number(b.count) || 0), 0) || 7;
  const firstCable = project.cables[0];
  const cSpec = `${cCount} Nos. x ${firstCable?.coreCount || 12} Core Signalling Cables`;

  for (let idx = 0; idx < Math.min(cCount, 4); idx++) {
    drawCircle(trX + 8 + idx * 6.5, trBot + 5, 2.2, 'CALLOUT');
  }
  for (let idx = 0; idx < Math.min(cCount - 4, 3); idx++) {
    drawCircle(trX + 11.25 + idx * 6.5, trBot + 10, 2.2, 'CALLOUT');
  }

  drawLine(trX + 22, trBot + 10, cbX + 55, cbY + 24, 'CALLOUT');
  drawText(cSpec, cbX + 56, cbY + 24, 2.2, 'CALLOUT');
  drawText(`Conductor: ${firstCable?.conductorSize || '1.5 sq mm'} Armoured`, cbX + 56, cbY + 19, 1.8, 'CALLOUT');
  drawText('Sand Bedding: 50mm Cushion', cbX + 56, cbY + 14, 1.6, 'CALLOUT');

  // 6. LEGEND
  const legX = 240.0;
  const legY = 205.0;
  const legW = 160.0;
  const legH = 75.0;
  drawRect(legX, legY, legW, legH, 'LEGEND');
  drawText('LEGEND / SYMBOLS USED IN DRAWING:', legX + 4, legY + legH - 5, 2.2, 'LEGEND');
  drawText('[ - ] LOC BOX (APPARATUS CASE) - Cable termination', legX + 4, legY + legH - 12, 1.8, 'LEGEND');
  drawText('[ - ] NORMAL TRENCH - 1.0m depth with sand cushion', legX + 4, legY + legH - 18, 1.8, 'LEGEND');
  drawText('[ - ] TRENCHLESS / HDD - Hatched pipe, min 1.5m depth', legX + 4, legY + legH - 24, 1.8, 'LEGEND');
  drawText('[ - ] GI PIPE CASING - Double line for track/culvert', legX + 4, legY + legH - 30, 1.8, 'LEGEND');
  drawText('[ - ] DIMENSION LINE - Length in metres with arrows', legX + 4, legY + legH - 36, 1.8, 'LEGEND');

  // End Entities and File
  add(0, 'ENDSEC');
  add(0, 'EOF');

  return lines.join('\n');
}


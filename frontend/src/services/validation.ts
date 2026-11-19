import { DrawingProject, ValidationResult } from '../types/drawing';

export function validateDrawingProject(project: DrawingProject): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalLength = project.segments.reduce((acc, seg) => acc + (Number(seg.length) || 0), 0);

  if (project.segments.length === 0) {
    errors.push('No route segments defined. Add at least one cable route segment.');
  }

  if (totalLength <= 0) {
    errors.push('Total cable route length must be greater than 0 metres.');
  }

  if (!project.metadata.drawingNumber || project.metadata.drawingNumber.trim() === '') {
    warnings.push('Drawing Number is empty. A unique Indian Railways drawing number is required before final approval.');
  }

  if (!project.metadata.workName || project.metadata.workName.trim() === '') {
    warnings.push('Name of Work is required in the Indian Railways title block.');
  }

  project.segments.forEach((seg, index) => {
    const segNum = index + 1;
    const len = Number(seg.length) || 0;
    const depth = Number(seg.depth) || 0;
    const method = seg.layingMethod;

    if (len <= 0) {
      errors.push(`Segment #${segNum} has invalid length (${len} m). Length must be positive.`);
    }

    if (method === 'Normal Trenching' && depth < 1.0) {
      warnings.push(`Segment #${segNum} (${method}): Depth ${depth}m is below IRSEM minimum of 1.0m for normal soil (IRSEM Para 15.5.1).`);
    } else if ((method === 'Track crossing' || method === 'Rail crossing') && depth < 1.2) {
      warnings.push(`Segment #${segNum} (${method}): Depth ${depth}m is below IRSEM mandatory minimum of 1.2m below rail flange (IRSEM Para 15.5.3).`);
    } else if (method === 'Trenchless-HDD' && depth < 1.5) {
      warnings.push(`Segment #${segNum} (${method}): Depth ${depth}m is below RDSO recommended 1.5m for HDD under railway formation.`);
    } else if (method === 'Road crossing' && depth < 1.0) {
      warnings.push(`Segment #${segNum} (${method}): Road crossing depth ${depth}m is below IRSEM minimum of 1.0m.`);
    }

    if (method === 'Track crossing' && !seg.coverType.toLowerCase().includes('pipe')) {
      warnings.push(`Segment #${segNum} (${method}): Track crossings must use approved GI/RCC/HDPE pipe casing (RDSO/SPN/196).`);
    }

    if (method === 'Road crossing' && !seg.coverType.toLowerCase().includes('pipe')) {
      warnings.push(`Segment #${segNum} (${method}): Road crossings require pipe casing extending 1.0m on either side of roadway.`);
    }
  });

  if (project.cables.length === 0) {
    warnings.push('No cables defined in the cable schedule. Add signalling or power cables.');
  } else {
    const totalCables = project.cables.reduce((acc, c) => acc + (Number(c.count) || 0), 0);
    const totalCores = project.cables.reduce(
      (acc, c) => acc + (Number(c.count) || 0) * (Number(c.coreCount) || 0),
      0
    );

    if (totalCables > 12) {
      warnings.push(
        `High cable bundle density (${totalCables} cables, ${totalCores} total cores). Ensure trench width or pipe diameter is enlarged per IRSEM Para 15.6.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    totalLength,
    errors,
    warnings,
  };
}

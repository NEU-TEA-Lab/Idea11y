import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { ClusterItems } from '../components/types';

export const exportToWord = async (
  data: Record<string, ClusterItems>,
  clusterCount: string,
  colorCount: string
) => {

  const date = new Date();
  const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const frameCount = Object.keys(data).length - 1 === 1 ? "1 Frame" : `${Object.keys(data).length - 1} Frames`;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: `ideally Board Review - ${dateString}`,
          heading: HeadingLevel.HEADING_1,
        }),

        // Board Overview
        new Paragraph({
          text: "Board Overview",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun(`${frameCount}`),
            new TextRun({ text: "\n" }),
            new TextRun(`${clusterCount}`),
            new TextRun({ text: "\n" }),
            new TextRun(`${colorCount}`),
          ],
        }),

        // Frames and their content
        ...Object.entries(data).map(([frameTitle, frameData]) => [
          new Paragraph({
            text: frameTitle,
            heading: HeadingLevel.HEADING_3,
          }),
          ...Object.entries(frameData.children).map(([clusterTitle, cluster]) => [
            new Paragraph({
              text: clusterTitle,
              heading: HeadingLevel.HEADING_4,
            }),
            ...Object.entries(cluster.content).map(([itemId, content]) => 
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun(content.replace(/<[^>]*>/g, '')),
                ],
              })
            ),
          ]).flat(),
        ]).flat(),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "ideally board result.docx");
};
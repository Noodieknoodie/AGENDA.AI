// backend/src/utils/docx-utils.ts
// @ts-nocheck - Disabling type checking for this file due to dynamic imports and docx library issues
import fs from 'fs-extra';
import path from 'path';

// We'll import docx dynamically to avoid TypeScript errors with the Document class
export async function processClientMeetingData(jsonData: any, templatePath: string): Promise<any> {
  try {
    const docx = await import('docx');
    
    // Create a new document
    const doc = new docx.Document({
      sections: [{
        children: [] as docx.Paragraph[]
      }]
    });
    
    // Process client information
    const clientName = jsonData.client?.name || 'N/A';
    const meetingDate = jsonData.client?.date || 'N/A';

    // Process account summary
    const totalValue = jsonData.summary?.total_value || 'N/A';
    const totalIncome = jsonData.summary?.total_income || 'N/A';

    // Process accounts
    const accounts = jsonData.accounts || [];

    // Process talking points
    const otherTopics = jsonData.otherTopics || [];

    // Build the document content
    const children: docx.Paragraph[] = [];

    // Add title
    children.push(
      new docx.Paragraph({
        text: `${clientName} - Meeting Agenda`,
        heading: docx.HeadingLevel.HEADING_1,
        spacing: {
          after: 200,
        },
      })
    );

    // Add meeting date
    children.push(
      new docx.Paragraph({
        text: `Date: ${meetingDate}`,
        spacing: {
          after: 200,
        },
      })
    );

    // Add summary section
    children.push(
      new docx.Paragraph({
        text: 'Account Summary',
        heading: docx.HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
      })
    );

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: 'Total Portfolio Value: ',
            bold: true,
          }),
          new docx.TextRun({
            text: totalValue,
          }),
        ],
      })
    );

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: 'Total Annual Income: ',
            bold: true,
          }),
          new docx.TextRun({
            text: totalIncome,
          }),
        ],
        spacing: {
          after: 200,
        },
      })
    );

    // Add accounts section
    if (accounts.length > 0) {
      children.push(
        new docx.Paragraph({
          text: 'Account Details',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      );

      for (const account of accounts) {
        children.push(
          new docx.Paragraph({
            text: `Account ${account.count}: xxxx-${account.last_four}`,
            heading: docx.HeadingLevel.HEADING_3,
            spacing: {
              before: 200,
              after: 100,
            },
          })
        );

        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: 'Value: ', bold: true }),
              new docx.TextRun({ text: account.account_value }),
            ],
          })
        );

        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: 'Cash Flow: ', bold: true }),
              new docx.TextRun({ text: account.account_cash_flow }),
            ],
          })
        );

        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: 'YTD Performance: ', bold: true }),
              new docx.TextRun({ text: account.account_performance_ytd }),
            ],
          })
        );

        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: 'Allocation: ', bold: true }),
              new docx.TextRun({ text: account.account_allocation }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      }
    }

    // Add talking points section
    if (otherTopics.length > 0) {
      children.push(
        new docx.Paragraph({
          text: 'Discussion Topics',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      );

      for (const topic of otherTopics) {
        children.push(
          new docx.Paragraph({
            text: topic.title,
            heading: docx.HeadingLevel.HEADING_3,
            spacing: {
              before: 200,
              after: 100,
            },
          })
        );

        if (topic.notes) {
          children.push(
            new docx.Paragraph({
              text: topic.notes,
              spacing: {
                after: 100,
              },
            })
          );
        }

        if (topic.items && topic.items.length > 0) {
          for (const item of topic.items) {
            if (typeof item === 'string') {
              children.push(
                new docx.Paragraph({
                  text: item,
                  bullet: {
                    level: 0,
                  },
                })
              );
            } else if (typeof item === 'object' && item.title) {
              children.push(
                new docx.Paragraph({
                  text: item.title,
                  bullet: {
                    level: 0,
                  },
                })
              );

              if (item.details && Array.isArray(item.details)) {
                for (const detail of item.details) {
                  children.push(
                    new docx.Paragraph({
                      text: detail,
                      bullet: {
                        level: 1,
                      },
                    })
                  );
                }
              }
            }
          }
        }
      }
    }

    // Create a new section with our content
    const newSection = {
      children: children
    };
    
    // Replace the first section in the document
    doc.sections[0] = newSection;

    return doc;
  } catch (error) {
    console.error('Error processing client meeting data:', error);
    throw error;
  }
}

export async function processGeneralMeetingData(jsonData: any, templatePath: string): Promise<any> {
  try {
    const docx = await import('docx');
    
    // Create a new document
    const doc = new docx.Document({
      sections: [{
        children: [] as docx.Paragraph[]
      }]
    });

    // Extract data from the JSON
    const meetingTitle = jsonData.meeting?.title || 'Meeting Agenda';
    const meetingDate = jsonData.meeting?.date || 'N/A';
    const participants = jsonData.meeting?.participants || [];

    const objective = jsonData.objective?.summary || '';
    const objectiveDetails = jsonData.objective?.details || '';

    const agendaItems = jsonData.agendaItems || [];
    const additionalNotes = jsonData.additionalNotes || '';

    const actionItems = jsonData.nextSteps?.actionItems || [];
    const nextMeeting = jsonData.nextSteps?.nextMeeting || '';

    // Build the document content
    const children: docx.Paragraph[] = [];

    // Add title
    children.push(
      new docx.Paragraph({
        text: meetingTitle,
        heading: docx.HeadingLevel.HEADING_1,
        spacing: {
          after: 200,
        },
      })
    );

    // Add meeting date
    children.push(
      new docx.Paragraph({
        text: `Date: ${meetingDate}`,
        spacing: {
          after: 200,
        },
      })
    );

    // Add participants if available
    if (participants.length > 0) {
      children.push(
        new docx.Paragraph({
          text: 'Participants:',
          heading: docx.HeadingLevel.HEADING_3,
          spacing: {
            before: 200,
            after: 100,
          },
        })
      );

      children.push(
        new docx.Paragraph({
          text: Array.isArray(participants) ? participants.join(', ') : participants.toString(),
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add meeting objective if available
    if (objective) {
      children.push(
        new docx.Paragraph({
          text: 'Meeting Objective',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 100,
          },
        })
      );

      children.push(
        new docx.Paragraph({
          text: objective,
          spacing: {
            after: 100,
          },
        })
      );

      if (objectiveDetails) {
        children.push(
          new docx.Paragraph({
            text: objectiveDetails,
            spacing: {
              after: 200,
            },
          })
        );
      }
    }

    // Add agenda items
    if (agendaItems.length > 0) {
      children.push(
        new docx.Paragraph({
          text: 'Agenda Items',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      );

      for (const item of agendaItems) {
        let titleText = item.title;

        if (item.timeAllocation) {
          titleText += ` (${item.timeAllocation})`;
        }

        if (item.presenter) {
          titleText += ` - ${item.presenter}`;
        }

        children.push(
          new docx.Paragraph({
            text: titleText,
            heading: docx.HeadingLevel.HEADING_3,
            spacing: {
              before: 200,
              after: 100,
            },
          })
        );

        if (item.notes) {
          children.push(
            new docx.Paragraph({
              text: item.notes,
              spacing: {
                after: 100,
              },
            })
          );
        }

        if (item.subItems && item.subItems.length > 0) {
          for (const subItem of item.subItems) {
            children.push(
              new docx.Paragraph({
                text: subItem,
                bullet: {
                  level: 0,
                },
              })
            );
          }
        }
      }
    }

    // Add additional notes if available
    if (additionalNotes) {
      children.push(
        new docx.Paragraph({
          text: 'Additional Notes',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 100,
          },
        })
      );

      children.push(
        new docx.Paragraph({
          text: additionalNotes,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add action items if available
    if (actionItems.length > 0) {
      children.push(
        new docx.Paragraph({
          text: 'Action Items',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 100,
          },
        })
      );

      for (const item of actionItems) {
        let actionText = item.description;

        if (item.owner) {
          actionText += ` (Owner: ${item.owner})`;
        }

        if (item.dueDate) {
          actionText += ` - Due: ${item.dueDate}`;
        }

        children.push(
          new docx.Paragraph({
            text: actionText,
            bullet: {
              level: 0,
            },
          })
        );
      }
    }

    // Add next meeting info if available
    if (nextMeeting) {
      children.push(
        new docx.Paragraph({
          text: 'Next Meeting',
          heading: docx.HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 100,
          },
        })
      );

      children.push(
        new docx.Paragraph({
          text: nextMeeting,
        })
      );
    }

    // Create a new section with our content
    const newSection = {
      children: children
    };
    
    // Replace the first section in the document
    doc.sections[0] = newSection;

    return doc;
  } catch (error) {
    console.error('Error processing general meeting data:', error);
    throw error;
  }
}

export async function createDefaultTemplate(templatePath: string): Promise<void> {
  try {
    const docx = await import('docx');
    
    // Create a simple default template if none exists
    const doc = new docx.Document({
      sections: [{
        children: [
          new docx.Paragraph({
            text: "Meeting Agenda",
            heading: docx.HeadingLevel.HEADING_1,
          }),
          new docx.Paragraph({
            text: "This is a placeholder template. Please place your actual template file at the specified location.",
          }),
        ],
      }],
    });

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(templatePath));

    // Save the template
    const buffer = await docx.Packer.toBuffer(doc);
    await fs.writeFile(templatePath, buffer);
  } catch (error) {
    console.error('Error creating default template:', error);
    throw error;
  }
}
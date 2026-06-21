import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_report_pdf(title: str, content: str) -> bytes:
    """
    Parses Markdown report text and generates a styled PDF file in memory.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    brand_blue = colors.HexColor('#2563eb')
    text_dark = colors.HexColor('#1e293b')
    text_gray = colors.HexColor('#64748b')
    border_color = colors.HexColor('#cbd5e1')
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=brand_blue,
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8
    )
    
    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=text_dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )
    
    cell_header_style = ParagraphStyle(
        'TableHeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []
    
    # 1. Document Title
    story.append(Paragraph(title, title_style))
    story.append(Paragraph("SmartSeller AI Autonomous Strategy Briefing", ParagraphStyle('Sub', parent=body_style, textColor=text_gray, fontSize=10)))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceAfter=15))

    # 2. Parse content line by line
    lines = content.split('\n')
    inside_table = False
    table_headers = []
    table_rows = []

    for line in lines:
        line_str = line.strip()
        
        # Table Parser
        if line_str.startswith('|') and line_str.endswith('|'):
            inside_table = True
            cells = [c.strip() for c in line_str.split('|')[1:-1]]
            
            # Skip divider row
            if cells and all(c.startswith('-') or c.endswith('-') for c in cells):
                continue
                
            if not table_headers:
                table_headers = cells
            else:
                table_rows.append(cells)
            continue
        elif inside_table:
            # Construct and render the table
            col_widths = [doc.width / len(table_headers)] * len(table_headers)
            
            formatted_data = []
            # Header Row
            formatted_data.append([Paragraph(h, cell_header_style) for h in table_headers])
            # Data Rows
            for row in table_rows:
                formatted_data.append([Paragraph(cell, cell_style) for cell in row])
                
            pdf_table = Table(formatted_data, colWidths=col_widths)
            pdf_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), brand_blue),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ('GRID', (0,0), (-1,-1), 0.5, border_color),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            
            story.append(pdf_table)
            story.append(Spacer(1, 10))
            
            inside_table = False
            table_headers = []
            table_rows = []
            
        if line_str == '':
            continue
            
        # Parse standard Markdown blocks
        if line_str.startswith('# '):
            story.append(Paragraph(line_str.replace('# ', ''), h1_style))
        elif line_str.startswith('## '):
            story.append(Paragraph(line_str.replace('## ', ''), h1_style))
        elif line_str.startswith('### '):
            story.append(Paragraph(line_str.replace('### ', ''), h2_style))
        elif line_str.startswith('- ') or line_str.startswith('* '):
            bullet_text = line_str.replace('- ', '').replace('* ', '')
            # Strip simple double asterisks for bolding
            bullet_text = bullet_text.replace('**', '')
            story.append(Paragraph(f"&bull; {bullet_text}", bullet_style))
        else:
            para_text = line_str.replace('**', '')
            story.append(Paragraph(para_text, body_style))
            
    # Build Document
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

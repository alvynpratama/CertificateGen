import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import QRCode from "react-qr-code"; 
import templateImages from '../../assets/templates'; 

const DragItem = ({ positions, onDrag, isPreview, zoomLevel, id, children, defaultStyle }) => {
    const nodeRef = useRef(null); 
    const { x = 0, y = 0 } = positions[id] || {};
    const isDesc = id === 'desc';

    const dragBoxStyle = {
        position: 'absolute', ...defaultStyle, zIndex: 20,
        userSelect: 'none', cursor: isPreview ? 'move' : 'default', 
        maxWidth: isDesc ? '900px' : 'none', 
    };

    const contentStyle = {
        border: isPreview ? '1px dashed rgba(33, 150, 243, 0.4)' : 'none',
        backgroundColor: isPreview ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        padding: '2px', textAlign: 'center', minWidth: '20px', display: 'inline-block',
        whiteSpace: isDesc ? 'pre-wrap' : 'nowrap', wordBreak: isDesc ? 'break-word' : 'normal', lineHeight: '1.2'
    };

    if (isPreview) {
        return (
            <Draggable nodeRef={nodeRef} position={{x, y}} onStop={(e, data) => onDrag(id, { x: data.x, y: data.y })} scale={zoomLevel}>
                <div ref={nodeRef} style={dragBoxStyle}>
                    <div style={contentStyle}>{children}</div>
                </div>
            </Draggable>
        );
    } else {
        const printStyle = { ...dragBoxStyle, transform: `translate(${x}px, ${y}px)`, border: 'none', background: 'none' };
        return ( <div style={printStyle}><div style={{...contentStyle, border:'none'}}>{children}</div></div> );
    }
};

export class ComponentToPrint extends React.PureComponent {
    render() {
        const { positions, onDrag, isPreview, signatureImg, date, logo, 
                customBackground, name, heading, desc, author, template, 
                textStyles, imageStyles, zoom, showQR, qrValue, qrColor, qrScale } = this.props;
        
        const bgSource = template === 'custom' ? customBackground : templateImages[template];
        const itemProps = { positions, onDrag, isPreview, zoomLevel: zoom || 1 };
        
        const getTextStyle = (id) => ({
            color: textStyles[id]?.color || '#000',
            fontSize: `${textStyles[id]?.fontSize || 20}px`,
            fontFamily: textStyles[id]?.fontFamily || 'Montserrat', 
            fontWeight: textStyles[id]?.fontWeight || 'normal', 
            fontStyle: textStyles[id]?.fontStyle || 'normal',
            margin: 0, textShadow: '0px 0px 1px rgba(0,0,0,0.1)'
        });

        const getImageStyle = (id) => ({
            width: '120px', 
            pointerEvents: 'none',
            transform: `scale(${imageStyles[id]?.scale || 1})`,
            opacity: imageStyles[id]?.opacity ?? 1,
            transformOrigin: 'center'
        });

        // Style khusus QR Code
        const getQrStyle = () => ({
            transform: `scale(${qrScale || 1})`, // Terapkan scale dari slider
            transformOrigin: 'center',
            display: 'inline-block'
        });

        const containerStyle = { 
            position: 'relative', width: '1123px', height: '794px', 
            overflow: 'hidden', margin: '0 auto', 
            backgroundImage: bgSource ? `url(${bgSource})` : 'none', backgroundSize: '100% 100%', 
            backgroundPosition: 'center', backgroundColor: 'white', boxShadow: isPreview ? '0 0 20px rgba(0,0,0,0.2)' : 'none'
        };

        return (
            <div style={containerStyle} id={this.props.id || "certificate-canvas"}>
                <DragItem id="heading" defaultStyle={{ top: '15%', left: '0', width: '100%' }} {...itemProps}>
                     <h2 style={{ textTransform: 'uppercase', ...getTextStyle('heading') }}>{heading || 'Certificate of Achievement'}</h2>
                </DragItem>
                <DragItem id="name" defaultStyle={{ top: '35%', left: '0', width: '100%' }} {...itemProps}>
                    <h1 style={getTextStyle('name')}>{name || 'Participant Name'}</h1>
                </DragItem>
                <DragItem id="desc" defaultStyle={{ top: '55%', left: '10%', width: '80%' }} {...itemProps}>
                    <p style={getTextStyle('desc')}>{desc || 'For active participation in the event.'}</p>
                </DragItem>
                <DragItem id="author" defaultStyle={{ top: '75%', left: '20%' }} {...itemProps}>
                     <h3 style={{ borderTop: `2px solid ${getTextStyle('author').color}`, padding: '0 20px', display:'inline-block', ...getTextStyle('author') }}>{author || 'Director'}</h3>
                </DragItem>
                
                {date && <DragItem id="date" defaultStyle={{ top: '70%', left: '70%' }} {...itemProps}><p style={getTextStyle('date')}>{date}</p></DragItem>}
                
                {logo && <DragItem id="logo" defaultStyle={{ top: '10%', right: '10%', width: 'auto' }} {...itemProps}>
                    <img src={logo} alt="logo" style={getImageStyle('logo')} />
                </DragItem>}
                
                {signatureImg && <DragItem id="signature" defaultStyle={{ top: '65%', left: '25%', width: 'auto' }} {...itemProps}>
                    <img src={signatureImg} alt="ttd" style={{ width: '200px', ...getImageStyle('signature') }} />
                </DragItem>}
                
                {showQR && qrValue && (
                    <DragItem id="qr" defaultStyle={{ top: '70%', right: '10%', width: 'auto' }} {...itemProps}>
                        <div style={getQrStyle()}>
                            <QRCode value={qrValue} size={80} fgColor={qrColor || '#000000'} bgColor="transparent" />
                        </div>
                    </DragItem>
                )}
            </div>
        );
    }
}

export default ComponentToPrint;
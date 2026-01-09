import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import QRCode from 'react-qr-code';
import templateImages from '../../assets/templates'; 

const ComponentToPrint = ({ 
    isPreview, template, 
    heading, name, desc, author, date, styles, extraTexts,
    selectedId, setSelectedId, onStyleChange,
    logo, customBackground, signatureImg, 
    showQR, qrValue, qrColor, 
    imageStyles, handleImageStyleChange,
    qrStyle, handleQrStyleChange,
    zoom, showWatermark, watermarkImg
}) => {
    
    const itemsRef = useRef({});
    const [target, setTarget] = useState(null);

    useEffect(() => {
        if (!selectedId || !isPreview) {
            setTarget(null);
            return;
        }
        const el = itemsRef.current[selectedId];
        setTarget(el);
    }, [selectedId, isPreview, heading, name, desc, author, date, extraTexts, logo, signatureImg, showQR]);

    const getBg = () => {
        if (template === 'custom' && customBackground) return customBackground;
        return templateImages[template] || templateImages['template1'];
    };

    // --- RENDER TEXT ---
    const renderText = (id, text, styleObj) => {
        const s = styleObj || {};
        const x = parseFloat(s.x) || 0;
        const y = parseFloat(s.y) || 0;
        const width = parseFloat(s.width) || 300;
        const fontSize = parseFloat(s.fontSize) || 24;

        return (
            <div
                id={id}
                key={id}
                ref={(el) => (itemsRef.current[id] = el)}
                onClick={(e) => {
                    e.stopPropagation();
                    if(isPreview && setSelectedId) setSelectedId(id);
                }}
                style={{
                    position: 'absolute',
                    transform: `translate(${x}px, ${y}px)`, 
                    width: `${width}px`,
                    fontSize: `${fontSize}px`,
                    fontFamily: s.fontFamily || 'Montserrat',
                    color: s.color || '#000',
                    fontWeight: s.fontWeight,
                    fontStyle: s.fontStyle,
                    textAlign: 'center',
                    zIndex: 20,
                    cursor: isPreview ? 'move' : 'default',
                    border: (isPreview && selectedId === id) ? '1px dashed #8e44ad' : '1px solid transparent',
                    padding: '5px',
                    paddingTop: id === 'author' ? '10px' : '5px', 
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    lineHeight: 1.2,
                    userSelect: 'none', 
                    boxSizing: 'border-box'
                }}
            >
                {/* LOGIC GARIS PENANDATANGAN */}
                {id === 'author' && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        borderTop: `2px solid ${s.color || '#000'}`,
                        opacity: 0.7
                    }}></div>
                )}
                
                {text}
            </div>
        );
    };

    // --- RENDER IMAGE (LOGO & TTD) ---
    const renderImage = (id, src, styleObj) => {
        const s = styleObj || {};
        const x = parseFloat(s.x) || 50;
        const y = parseFloat(s.y) || 50;
        const width = parseFloat(s.width) || 150;

        return (
            <div
                id={id}
                key={id}
                ref={(el) => (itemsRef.current[id] = el)}
                onClick={(e) => {
                    e.stopPropagation();
                    if(isPreview && setSelectedId) setSelectedId(id);
                }}
                style={{
                    position: 'absolute',
                    transform: `translate(${x}px, ${y}px)`,
                    width: `${width}px`,
                    height: 'auto',
                    zIndex: 20,
                    cursor: isPreview ? 'move' : 'default',
                    border: (isPreview && selectedId === id) ? '1px dashed #8e44ad' : '1px solid transparent',
                    userSelect: 'none',
                    lineHeight: 0
                }}
            >
                <img 
                    src={src} 
                    alt={id} 
                    style={{ width: '100%', height: 'auto', pointerEvents: 'none', opacity: s.opacity || 1 }} 
                />
            </div>
        );
    };

    // --- RENDER QR CODE ---
    const renderQR = () => {
        const s = qrStyle || { x: 50, y: 600, width: 80 };
        const x = parseFloat(s.x);
        const y = parseFloat(s.y);
        const width = parseFloat(s.width);

        return (
            <div
                id="qr"
                key="qr"
                ref={(el) => (itemsRef.current['qr'] = el)}
                onClick={(e) => {
                    e.stopPropagation();
                    if(isPreview && setSelectedId) setSelectedId('qr');
                }}
                style={{
                    position: 'absolute',
                    transform: `translate(${x}px, ${y}px)`,
                    width: `${width}px`,
                    height: `${width}px`, 
                    zIndex: 20,
                    cursor: isPreview ? 'move' : 'default',
                    border: (isPreview && selectedId === 'qr') ? '1px dashed #8e44ad' : '1px solid transparent',
                    userSelect: 'none',
                    backgroundColor: 'transparent'
                }}
            >
                <QRCode 
                    value={qrValue} 
                    size={width} 
                    fgColor={qrColor} 
                    bgColor="transparent" 
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        );
    };

    return (
        <div 
            className="certificate-container" 
            style={{ 
                width: '1123px', height: '794px', position: 'relative', overflow: 'hidden', 
                backgroundColor: 'white', backgroundImage: `url(${getBg()})`, backgroundSize: 'cover', backgroundPosition: 'center',
                boxShadow: isPreview ? '0 10px 30px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => { if(isPreview && setSelectedId) setSelectedId(null); }}
        >
            {showWatermark && watermarkImg && (
                <div style={{
                    position: 'absolute',
                    bottom: '30px', 
                    right: '30px',

                    zIndex: 50, 

                    opacity: 0.35, 

                    pointerEvents: 'none',
                    width: '150px',
                    height: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img 
                        src={watermarkImg} 
                        alt="Watermark" 
                        style={{ width: '100%', height: 'auto' }} 
                    />
                </div>
            )}

            {renderText('heading', heading, styles.heading)}
            {renderText('name', name, styles.name)}
            {renderText('desc', desc, styles.desc)}
            {renderText('author', author, styles.author)}
            {renderText('date', date, styles.date)}
            {extraTexts.map(t => renderText(t.id, t.text, t.style))}

            {logo && renderImage('logo', logo, imageStyles.logo)}
            {signatureImg && renderImage('signature', signatureImg, imageStyles.signature)}
            
            {showQR && renderQR()}

            {/* --- MOVEABLE CONTROLLER --- */}
            {isPreview && target && (
                <Moveable
                    target={target}
                    key={`moveable-${selectedId}`} 
                    draggable={true}
                    resizable={true}
                    keepRatio={selectedId === 'qr'} 
                    throttleDrag={0}
                    zoom={zoom || 1}

                    /* --- LOGIC DRAG --- */
                    onDragStart={({ set }) => {
                        const style = window.getComputedStyle(target);
                        const matrix = new DOMMatrixReadOnly(style.transform);
                        set([matrix.m41, matrix.m42]);
                    }}
                    onDrag={({ target, beforeTranslate }) => {
                        target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
                    }}
                    onDragEnd={({ lastEvent }) => {
                        if (lastEvent) {
                            const [x, y] = lastEvent.beforeTranslate;
                            
                            if (selectedId === 'qr') {
                                handleQrStyleChange('x', x);
                                handleQrStyleChange('y', y);
                            } else if (['logo', 'signature'].includes(selectedId)) {
                                handleImageStyleChange(selectedId, 'x', x);
                                handleImageStyleChange(selectedId, 'y', y);
                            } else {
                                onStyleChange(selectedId, 'x', x);
                                onStyleChange(selectedId, 'y', y);
                            }
                        }
                    }}

                    /* --- LOGIC RESIZE --- */
                    onResizeStart={({ setOrigin, dragStart }) => {
                        setOrigin(["%", "%"]);
                        const style = window.getComputedStyle(target);
                        const matrix = new DOMMatrixReadOnly(style.transform);
                        if (dragStart) {
                            dragStart.set([matrix.m41, matrix.m42]);
                        }
                    }}
                    
                    onResize={({ target, width, height, drag, direction }) => {
                        const dirs = direction || [0, 0];
                        const isCorner = dirs[0] !== 0 && dirs[1] !== 0;
                        const isQR = selectedId === 'qr';
                        const isImage = ['logo', 'signature'].includes(selectedId);

                        if (drag && drag.beforeTranslate) {
                            target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
                        }
                        
                        const oldWidth = parseFloat(target.style.width) || width;
                        target.style.width = `${width}px`;
                        
                        if (isQR) {
                            target.style.height = `${width}px`;
                        }

                        if (!isImage && !isQR && isCorner && oldWidth > 0) {
                            const scaleRatio = width / oldWidth;
                            const currentFontSize = parseFloat(target.style.fontSize) || 12;
                            const newFontSize = currentFontSize * scaleRatio;
                            target.style.fontSize = `${Math.max(1, newFontSize)}px`;
                        }
                    }}
                    
                    onResizeEnd={({ target, lastEvent }) => {
                        if (lastEvent) {
                            const newWidth = parseFloat(target.style.width);
                            const isQR = selectedId === 'qr';
                            const isImage = ['logo', 'signature'].includes(selectedId);

                            if (isQR) {
                                handleQrStyleChange('width', newWidth);
                                if (lastEvent.drag) {
                                    const [newX, newY] = lastEvent.drag.beforeTranslate;
                                    handleQrStyleChange('x', newX);
                                    handleQrStyleChange('y', newY);
                                }
                            } else if (isImage) {
                                handleImageStyleChange(selectedId, 'width', newWidth);
                                if (lastEvent.drag) {
                                    const [newX, newY] = lastEvent.drag.beforeTranslate;
                                    handleImageStyleChange(selectedId, 'x', newX);
                                    handleImageStyleChange(selectedId, 'y', newY);
                                }
                            } else {
                                onStyleChange(selectedId, 'width', newWidth);
                                onStyleChange(selectedId, 'fontSize', parseFloat(target.style.fontSize));
                                if (lastEvent.drag) {
                                    const [newX, newY] = lastEvent.drag.beforeTranslate;
                                    onStyleChange(selectedId, 'x', newX);
                                    onStyleChange(selectedId, 'y', newY);
                                }
                            }
                        }
                    }}
                    
                    renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} 
                    edge={false} 
                    origin={false}
                    padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
                />
            )}
        </div>
    );
};

export default ComponentToPrint;
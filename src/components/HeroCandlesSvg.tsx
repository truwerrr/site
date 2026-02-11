"use client";

import { useId } from "react";

export default function HeroCandlesSvg({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 400 512"
      width={400}
      height={512}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    >
      <defs>
        <clipPath id={`hero-candles-clip-98-${id}`}>
          <rect width={400} height={512} x={0} y={0} />
        </clipPath>
        <clipPath id={`hero-candles-clip-100-${id}`}>
          <path d="M0,0 L400,0 L400,512 L0,512z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#hero-candles-clip-98-${id})`}>
        <g clipPath={`url(#hero-candles-clip-100-${id})`} className="hero-candles-breathe" transform="matrix(1,0,0,1,0,0)" opacity={1} style={{ display: "block" }}>
          {/* Свечи у левой стенки */}
          <g className="1" transform="matrix(1,0,0,1,2,240)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,64 1,64" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,-5.25,256)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,12.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,12 C4,12 -4,12 -4,12 C-6.2,12 -8,10.2 -8,8 C-8,8 -8,-8 -8,-8 C-8,-10.2 -6.2,-12 -4,-12 C-4,-12 4,-12 4,-12 C6.2,-12 8,-10.2 8,-8 C8,-8 8,8 8,8 C8,10.2 6.2,12 4,12z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,8,160)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,92 1,92" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,0.75,188)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,18.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,18 C4,18 -4,18 -4,18 C-6.2,18 -8,16.2 -8,14 C-8,14 -8,-14 -8,-14 C-8,-16.2 -6.2,-18 -4,-18 C-4,-18 4,-18 4,-18 C6.2,-18 8,-16.2 8,-14 C8,-14 8,14 8,14 C8,16.2 6.2,18 4,18z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,14,310)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,52 1,52" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,6.75,322)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,10.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,10 C4,10 -4,10 -4,10 C-6.2,10 -8,8.2 -8,6 C-8,6 -8,-6 -8,-6 C-8,-8.2 -6.2,-10 -4,-10 C-4,-10 4,-10 4,-10 C6.2,-10 8,-8.2 8,-6 C8,-6 8,6 8,6 C8,8.2 6.2,10 4,10z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,18,199)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,78 1,78" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,10.75,237.90118408203125)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,9.75)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,9.5 C4,9.5 -4,9.5 -4,9.5 C-6.209000110626221,9.5 -8,7.709000110626221 -8,5.5 C-8,5.5 -8,-5.5 -8,-5.5 C-8,-7.709000110626221 -6.209000110626221,-9.5 -4,-9.5 C-4,-9.5 4,-9.5 4,-9.5 C6.209000110626221,-9.5 8,-7.709000110626221 8,-5.5 C8,-5.5 8,5.5 8,5.5 C8,7.709000110626221 6.209000110626221,9.5 4,9.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,44,238)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,115 1,115" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,36.75,250.3793182373047)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,21.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,21 C4,21 -4,21 -4,21 C-6.209000110626221,21 -8,19.208999633789062 -8,17 C-8,17 -8,-17 -8,-17 C-8,-19.208999633789062 -6.209000110626221,-21 -4,-21 C-4,-21 4,-21 4,-21 C6.209000110626221,-21 8,-19.208999633789062 8,-17 C8,-17 8,17 8,17 C8,19.208999633789062 6.209000110626221,21 4,21z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,70,274)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,80 1,80" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,62.75,287.3468933105469)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,27.75)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,27.5 C4,27.5 -4,27.5 -4,27.5 C-6.209000110626221,27.5 -8,25.708999633789062 -8,23.5 C-8,23.5 -8,-23.5 -8,-23.5 C-8,-25.708999633789062 -6.209000110626221,-27.5 -4,-27.5 C-4,-27.5 4,-27.5 4,-27.5 C6.209000110626221,-27.5 8,-25.708999633789062 8,-23.5 C8,-23.5 8,23.5 8,23.5 C8,25.708999633789062 6.209000110626221,27.5 4,27.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,96,269)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,44 1,44" />
            </g>
          </g>
          <g transform="matrix(1,0,0,0.9988770484924316,88.75,278.5958251953125)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,12.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,12 C4,12 -4,12 -4,12 C-6.209000110626221,12 -8,10.208999633789062 -8,8 C-8,8 -8,-8 -8,-8 C-8,-10.208999633789062 -6.209000110626221,-12 -4,-12 C-4,-12 4,-12 4,-12 C6.209000110626221,-12 8,-10.208999633789062 8,-8 C8,-8 8,8 8,8 C8,10.208999633789062 6.209000110626221,12 4,12z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,122,291)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,144 1,144" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,114.75,317.9027404785156)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,43.75)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,43.5 C4,43.5 -4,43.5 -4,43.5 C-6.209000110626221,43.5 -8,41.70899963378906 -8,39.5 C-8,39.5 -8,-39.5 -8,-39.5 C-8,-41.70899963378906 -6.209000110626221,-43.5 -4,-43.5 C-4,-43.5 4,-43.5 4,-43.5 C6.209000110626221,-43.5 8,-41.70899963378906 8,-39.5 C8,-39.5 8,39.5 8,39.5 C8,41.70899963378906 6.209000110626221,43.5 4,43.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,148,246)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,75 1,75" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1.464509129524231,140.75,249.4692840576172)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,18.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,18 C4,18 -4,18 -4,18 C-6.209000110626221,18 -8,16.208999633789062 -8,14 C-8,14 -8,-14 -8,-14 C-8,-16.208999633789062 -6.209000110626221,-18 -4,-18 C-4,-18 4,-18 4,-18 C6.209000110626221,-18 8,-16.208999633789062 8,-14 C8,-14 8,14 8,14 C8,16.208999633789062 6.209000110626221,18 4,18z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,176,273)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,106 1,106" />
            </g>
          </g>
          <g transform="matrix(1,0,0,0.8370383381843567,168.75,290.7109375)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,26.75)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,26.5 C4,26.5 -4,26.5 -4,26.5 C-6.209000110626221,26.5 -8,24.708999633789062 -8,22.5 C-8,22.5 -8,-22.5 -8,-22.5 C-8,-24.708999633789062 -6.209000110626221,-26.5 -4,-26.5 C-4,-26.5 4,-26.5 4,-26.5 C6.209000110626221,-26.5 8,-24.708999633789062 8,-22.5 C8,-22.5 8,22.5 8,22.5 C8,24.708999633789062 6.209000110626221,26.5 4,26.5z" />
            </g>
          </g>
          {/* Доп. свечи к центру (не до конца) */}
          <g className="1" transform="matrix(1,0,0,1,162,210)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,62 1,62" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,154.75,228)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,11.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,11 C4,11 -4,11 -4,11 C-6.2,11 -8,9.2 -8,7 C-8,7 -8,-7 -8,-7 C-8,-9.2 -6.2,-11 -4,-11 C-4,-11 4,-11 4,-11 C6.2,-11 8,-9.2 8,-7 C8,-7 8,7 8,7 C8,9.2 6.2,11 4,11z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,178,268)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,88 1,88" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,170.75,282)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,24.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,24 C4,24 -4,24 -4,24 C-6.2,24 -8,22.2 -8,20 C-8,20 -8,-20 -8,-20 C-8,-22.2 -6.2,-24 -4,-24 C-4,-24 4,-24 4,-24 C6.2,-24 8,-22.2 8,-20 C8,-20 8,20 8,20 C8,22.2 6.2,24 4,24z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,194,188)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,95 1,95" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,186.75,218)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,19.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,19 C4,19 -4,19 -4,19 C-6.2,19 -8,17.2 -8,15 C-8,15 -8,-15 -8,-15 C-8,-17.2 -6.2,-19 -4,-19 C-4,-19 4,-19 4,-19 C6.2,-19 8,-17.2 8,-15 C8,-15 8,15 8,15 C8,17.2 6.2,19 4,19z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,172,256)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,48 1,48" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,164.75,268)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,8.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,8 C4,8 -4,8 -4,8 C-6.2,8 -8,6.2 -8,4 C-8,4 -8,-4 -8,-4 C-8,-6.2 -6.2,-8 -4,-8 C-4,-8 4,-8 4,-8 C6.2,-8 8,-6.2 8,-4 C8,-4 8,4 8,4 C8,6.2 6.2,8 4,8z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,204,178)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,82 1,82" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,196.75,202)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,16.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,16 C4,16 -4,16 -4,16 C-6.2,16 -8,14.2 -8,12 C-8,12 -8,-12 -8,-12 C-8,-14.2 -6.2,-16 -4,-16 C-4,-16 4,-16 4,-16 C6.2,-16 8,-14.2 8,-12 C8,-12 8,12 8,12 C8,14.2 6.2,16 4,16z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,216,248)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,72 1,72" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,208.75,262)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,14.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,14 C4,14 -4,14 -4,14 C-6.2,14 -8,12.2 -8,10 C-8,10 -8,-10 -8,-10 C-8,-12.2 -6.2,-14 -4,-14 C-4,-14 4,-14 4,-14 C6.2,-14 8,-12.2 8,-10 C8,-10 8,10 8,10 C8,12.2 6.2,14 4,14z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,238,298)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,54 1,54" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,230.75,312)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,9.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,9 C4,9 -4,9 -4,9 C-6.2,9 -8,7.2 -8,5 C-8,5 -8,-5 -8,-5 C-8,-7.2 -6.2,-9 -4,-9 C-4,-9 4,-9 4,-9 C6.2,-9 8,-7.2 8,-5 C8,-5 8,5 8,5 C8,7.2 6.2,9 4,9z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,200,276)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,76 1,76" />
            </g>
          </g>
          <g transform="matrix(1,0,0,0.8157031536102295,192.75,298.7425842285156)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,22.75)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,22.5 C4,22.5 -4,22.5 -4,22.5 C-6.209000110626221,22.5 -8,20.708999633789062 -8,18.5 C-8,18.5 -8,-18.5 -8,-18.5 C-8,-20.708999633789062 -6.209000110626221,-22.5 -4,-22.5 C-4,-22.5 4,-22.5 4,-22.5 C6.209000110626221,-22.5 8,-20.708999633789062 8,-18.5 C8,-18.5 8,18.5 8,18.5 C8,20.708999633789062 6.209000110626221,22.5 4,22.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,226,321)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,58 1,58" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,218.75,330.43048095703125)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,14.75)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,14.5 C4,14.5 -4,14.5 -4,14.5 C-6.209000110626221,14.5 -8,12.708999633789062 -8,10.5 C-8,10.5 -8,-10.5 -8,-10.5 C-8,-12.708999633789062 -6.209000110626221,-14.5 -4,-14.5 C-4,-14.5 4,-14.5 4,-14.5 C6.209000110626221,-14.5 8,-12.708999633789062 8,-10.5 C8,-10.5 8,10.5 8,10.5 C8,12.708999633789062 6.209000110626221,14.5 4,14.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,252,205)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,137 1,137" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1.123049020767212,244.75,241.08929443359375)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,29.75)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,29.5 C4,29.5 -4,29.5 -4,29.5 C-6.209000110626221,29.5 -8,27.708999633789062 -8,25.5 C-8,25.5 -8,-25.5 -8,-25.5 C-8,-27.708999633789062 -6.209000110626221,-29.5 -4,-29.5 C-4,-29.5 4,-29.5 4,-29.5 C6.209000110626221,-29.5 8,-27.708999633789062 8,-25.5 C8,-25.5 8,25.5 8,25.5 C8,27.708999633789062 6.209000110626221,29.5 4,29.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,278,265)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,87 1,87" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1.0399746894836426,270.75,301.5951232910156)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,13.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,13 C4,13 -4,13 -4,13 C-6.209000110626221,13 -8,11.208999633789062 -8,9 C-8,9 -8,-9 -8,-9 C-8,-11.208999633789062 -6.209000110626221,-13 -4,-13 C-4,-13 4,-13 4,-13 C6.209000110626221,-13 8,-11.208999633789062 8,-9 C8,-9 8,9 8,9 C8,11.208999633789062 6.209000110626221,13 4,13z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,304,218)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,213 1,213" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,296.75,258.6241149902344)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,65.75)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,65.5 C4,65.5 -4,65.5 -4,65.5 C-6.209000110626221,65.5 -8,63.70899963378906 -8,61.5 C-8,61.5 -8,-61.5 -8,-61.5 C-8,-63.70899963378906 -6.209000110626221,-65.5 -4,-65.5 C-4,-65.5 4,-65.5 4,-65.5 C6.209000110626221,-65.5 8,-63.70899963378906 8,-61.5 C8,-61.5 8,61.5 8,61.5 C8,63.70899963378906 6.209000110626221,65.5 4,65.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,330,112)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,321 1,321" />
            </g>
          </g>
          <g transform="matrix(1,0,0,0.9278528690338135,322.75,169.4517059326172)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,106.75)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,106.5 C4,106.5 -4,106.5 -4,106.5 C-6.209000110626221,106.5 -8,104.70899963378906 -8,102.5 C-8,102.5 -8,-102.5 -8,-102.5 C-8,-104.70899963378906 -6.209000110626221,-106.5 -4,-106.5 C-4,-106.5 4,-106.5 4,-106.5 C6.209000110626221,-106.5 8,-104.70899963378906 8,-102.5 C8,-102.5 8,102.5 8,102.5 C8,104.70899963378906 6.209000110626221,106.5 4,106.5z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,356,249)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,188 1,188" />
            </g>
          </g>
          <g transform="matrix(1,0,0,0.9394071102142334,348.75,278.0431823730469)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,72.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,72 C4,72 -4,72 -4,72 C-6.209000110626221,72 -8,70.20899963378906 -8,68 C-8,68 -8,-68 -8,-68 C-8,-70.20899963378906 -6.209000110626221,-72 -4,-72 C-4,-72 4,-72 4,-72 C6.209000110626221,-72 8,-70.20899963378906 8,-68 C8,-68 8,68 8,68 C8,70.20899963378906 6.209000110626221,72 4,72z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,382,233)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,130 1,130" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,374.75,273.0736999511719)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,27.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,27 C4,27 -4,27 -4,27 C-6.209000110626221,27 -8,25.208999633789062 -8,23 C-8,23 -8,-23 -8,-23 C-8,-25.208999633789062 -6.209000110626221,-27 -4,-27 C-4,-27 4,-27 4,-27 C6.209000110626221,-27 8,-25.208999633789062 8,-23 C8,-23 8,23 8,23 C8,25.208999633789062 6.209000110626221,27 4,27z" />
            </g>
          </g>
          {/* Свечи у правой стенки */}
          <g className="1" transform="matrix(1,0,0,1,398,268)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(36,240,191)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,58 1,58" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,390.75,282)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,11.25)">
              <path fill="rgb(36,240,191)" fillOpacity={1} d=" M4,11 C4,11 -4,11 -4,11 C-6.2,11 -8,9.2 -8,7 C-8,7 -8,-7 -8,-7 C-8,-9.2 -6.2,-11 -4,-11 C-4,-11 4,-11 4,-11 C6.2,-11 8,-9.2 8,-7 C8,-7 8,7 8,7 C8,9.2 6.2,11 4,11z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,392,142)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,118 1,118" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,384.75,176)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,22.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,22 C4,22 -4,22 -4,22 C-6.2,22 -8,20.2 -8,18 C-8,18 -8,-18 -8,-18 C-8,-20.2 -6.2,-22 -4,-22 C-4,-22 4,-22 4,-22 C6.2,-22 8,-20.2 8,-18 C8,-18 8,18 8,18 C8,20.2 6.2,22 4,22z" />
            </g>
          </g>
          <g className="1" transform="matrix(1,0,0,1,395,358)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(1,0,0,1,0,0)">
              <path strokeLinecap="round" strokeLinejoin="miter" fillOpacity={0} strokeMiterlimit={10} stroke="rgb(101,111,255)" strokeOpacity={1} strokeWidth={1} d=" M1,1 C1,1 1,72 1,72" />
            </g>
          </g>
          <g transform="matrix(1,0,0,1,387.75,378)" opacity={1} style={{ display: "block" }}>
            <g opacity={1} transform="matrix(0.5,0,0,1,8.25,14.25)">
              <path fill="rgb(101,111,255)" fillOpacity={1} d=" M4,14 C4,14 -4,14 -4,14 C-6.2,14 -8,12.2 -8,10 C-8,10 -8,-10 -8,-10 C-8,-12.2 -6.2,-14 -4,-14 C-4,-14 4,-14 4,-14 C6.2,-14 8,-12.2 8,-10 C8,-10 8,10 8,10 C8,12.2 6.2,14 4,14z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

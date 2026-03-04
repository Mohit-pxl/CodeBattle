import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const Stars = () => {
    const ref = useRef();

    const sphere = useMemo(() => {
        const count = 1500;
        const points = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 1.5 + Math.random() * 3;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            points[i * 3 + 2] = r * Math.cos(phi);
        }
        return points;
    }, []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 30;
        ref.current.rotation.y -= delta / 40;

        // Setup mouse interaction
        ref.current.position.x += (state.pointer.x * 0.5 - ref.current.position.x) * 0.05;
        ref.current.position.y += (state.pointer.y * 0.5 - ref.current.position.y) * 0.05;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial transparent color="#ffffff" size={0.01} sizeAttenuation={true} depthWrite={false} fog={false} />
            </Points>
        </group>
    );
};

export default function StarParticles() {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-[1]">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars />
            </Canvas>
        </div>
    );
}

import React from "react";
import {useLoader} from "react-three-fiber";
import * as THREE from "three";

interface CloudsProps {
  cloudMapAsset: string;
}

const Clouds: React.FC<CloudsProps> = ({cloudMapAsset}) => {
  console.log(cloudMapAsset);
  const clouds = useLoader(THREE.TextureLoader, cloudMapAsset);
  console.log(clouds);
  const meshRef = React.useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} scale={[1.02, 1.02, 1.02]}>
      <sphereBufferGeometry args={[1, 32, 32]} attach="geometry" />
      <meshLambertMaterial
        map={clouds}
        side={THREE.FrontSide}
        transparent
        opacity={0.7}
        attach="material"
      />
    </mesh>
  );
};

export default Clouds;

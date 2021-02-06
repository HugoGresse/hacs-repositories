declare module 'aframe-react' {
    import * as React from 'react'
    import { ReactNode } from 'react'

    export interface SceneProps {
        children: ReactNode
    }
    export class Scene extends React.Component<SceneProps, any> {}

    export interface EntityProps {
        text?: {
            [key: any]: any
        }
        light?: {
            [key: any]: any
        }
        geometry?: {
            [key: any]: any
        }
        material?: {
            [key: any]: any
        }
        position?: {
            [key: string]: number
        }
    }
    export class Entity extends React.Component<EntityProps> {}
}

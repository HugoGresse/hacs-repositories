import React from 'react'
import 'aframe'
import {Entity, Scene} from 'aframe-react';

export const TestAframe = () => {

    return <Scene>
        <Entity text={{
            value: "toto"
        }}/>
        <Entity light={{type: 'point'}}/>
        <Entity geometry={{primitive: 'box'}} material={{color: 'red'}} position={{x: 0, y: 0, z: -5}}/>

    </Scene>

}

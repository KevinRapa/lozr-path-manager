import {useState} from 'react';
import {CFG} from '../AllRooms.js';

interface PathDisplayProps {
	paths: string[][],
}

interface PathProps {
	path: string[]
}

function Path(props: PathProps): JSX.Element
{
	if (props.path.length === 0) {
		return <div> { "Error occurred" } </div>;
	} else if (props.path.length === 1) {
		return <div> { "You are already there" } </div>;
	}

	return <div> {
		props.path.map((pair: string): JSX.Element => {
			let splitPair: string[2] = pair.split(',');
			let toGetHere: string|undefined = CFG.doors[splitPair[0]];
			let thisRoom: string = CFG.areas[splitPair[1]];

			if (toGetHere !== undefined) {
				return <p> { "GO THROUGH " + toGetHere + " TO " + thisRoom } </p>;
			} else {
				return <p> { thisRoom } </p>;
			}
		})
	} </div>;
}

export function PathDisplay(props: PathDisplayProps): JSX.Element
{
	return <> {
		props.paths.map((path: string[]): JSX.Element => {
			return <Path path={path} />;
		})
	} </>;
}

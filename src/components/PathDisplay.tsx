import React from 'react';
import {useState} from 'react';
import {CFG} from '../util/AllRooms';

interface PathDisplayProps {
	paths: string[][],
	songWarps: Record<string, string>
}

interface PathProps {
	path: string[],
	songWarps: Record<string, string>
}

function Path(props: PathProps): JSX.Element
{
	if (props.path.length === 0) {
		return <div> { "No path found" } </div>;
	}

	return <div> {
		props.path.map((pair: string): JSX.Element => {
			let splitPair: string[] = pair.split(',');
			let toGetHere: string|undefined = CFG.doors[splitPair[0]];
			let thisRoomId: string = splitPair[1];
			let thisRoomName: string = CFG.areas[thisRoomId];

			if (toGetHere !== undefined) {
				return <p> { "GO THROUGH " + toGetHere + " TO " + thisRoomName } </p>;
			} else if (props.songWarps[thisRoomId]) {
				return <p> { "WARP USING " + CFG.warps[props.songWarps[thisRoomId]] + " TO " + thisRoomName } </p>
			} else {
				return <p> { "START AT " + thisRoomName } </p>;
			}
		})
	} </div>;
}

const DIGIT_RE = /^\d+$/;

export function PathDisplay(props: PathDisplayProps): JSX.Element
{
	const [maxPaths, setMaxPaths] = useState<number>(2);

	const trySetMaxPaths = (s: string) => {
		if (s.length < 3 && DIGIT_RE.test(s)) {
			setMaxPaths(Number(s));
		}
	};

	props.paths.sort((p1: string[], p2: string[]) => {
		return p1.length - p2.length;
	});

	// TODO: Messy
	return <> 
		<label>
			{"Max results:"}
			<textarea rows={1} cols={2}
			          defaultValue={maxPaths}
				  onChange={e => trySetMaxPaths(e.target.value)} />
		</label>
		<div> {
			props.paths.length ? props.paths
			                          .slice(0, Math.min(props.paths.length, maxPaths))
			                          .map(path => <Path path={path} songWarps={props.songWarps} />)
			                   : Path({ path: [], songWarps: props.songWarps } as PathProps) 
		} </div>
	</>;
}

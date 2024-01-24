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
				return <p> { "START AT " + thisRoom } </p>;
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

	return <> 
		<label>
			Max results:
			<textarea rows={1} cols={2}
			          defaultValue={maxPaths}
				  onChange={e => trySetMaxPaths(e.target.value)} />
		</label>
		<div> {
			props.paths.slice(0, Math.min(props.paths.length, maxPaths))
			           .map(path => <Path path={path} />)
		} </div>
	</>;
}

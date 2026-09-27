import {useState} from 'react';
import React from 'react';
import {CFG} from '../util/AllRooms';
import _ from 'lodash';

import './PathDisplay.css';

interface PathDisplayProps {
	paths: string[][],
	songWarps: Record<string, string>
}

interface PathProps {
	path: string[],
	songWarps: Record<string, string>
}

function Path(props: PathProps)
{
	if (props.path.length === 0) {
		return <div> { "No path found" } </div>;
	}

	return <div className=".path-display"> {
		props.path.map((pair: string): React.JSX.Element => {
			let splitPair: string[] = pair.split(',');
			let toGetHere: string|undefined = CFG.doors[splitPair[0]];
			let thisRoomId: string = splitPair[1];
			let thisRoomName: string = CFG.areas[thisRoomId];

			if (CFG.no_print_path.includes(splitPair[0])) {
				console.log(`Not printing door ${toGetHere} because it's obvious`);
				return <></>;
			}

			if (CFG.owls[thisRoomId]) {
				return <p>
					<span className="path-verb">{"TAKE "}</span>
					<span className="path-door">{toGetHere}</span>
				</p>;
			} else if (CFG.owls[splitPair[0].split('/')[0]]) {
				return <p>
					<span className="path-verb">{"FLY TO "}</span>
					<span className="path-room">{thisRoomName}</span>
				</p>;
			} else if (toGetHere !== undefined) {
				return <p>
					<span className="path-verb">{"GO THROUGH "}</span>
					<span className="path-door">{toGetHere}</span>
					<span className="path-conj">{" TO "}</span>
					<span className="path-room">{thisRoomName}</span>
				</p>;
			} else {
				let warpId: string|undefined = _.findKey(props.songWarps, (roomId: string) => roomId === thisRoomId);

				if (warpId !== undefined) {
					return <p>
						<span className="path-verb">{"WARP USING "}</span>
						<span className="path-door">{CFG.warps[warpId]}</span>
						<span className="path-conj">{" TO "}</span>
						<span className="path-room">{thisRoomName}</span>
					</p>
				} else {
					return <p>
						<span className="path-verb">{"START AT "}</span>
						<span className="path-room">{thisRoomName}</span>
					</p>;
				}
			}
		})
	} </div>;
}

const DIGIT_RE = /^\d+$/;

export function PathDisplay(props: PathDisplayProps): React.JSX.Element
{
	const [maxPaths, setMaxPaths] = useState<number>(2);

	const trySetMaxPaths = (s: string) => {
		if (s.length < 3 && DIGIT_RE.test(s)) {
			setMaxPaths(Number(s));
		}
	};

	let allPaths: React.JSX.Element|React.JSX.Element[] = (() => {
		if (props.paths.length) {
			return props.paths.sort((p1, p2) => p1.length - p2.length)
			                  .slice(0, Math.min(props.paths.length, maxPaths))
			                  .map(path => <Path path={path} songWarps={props.songWarps} />)
		} else {
			return <Path path={[]} songWarps={props.songWarps} />
		}
	})();

	return <div className="path-display-container">
		<label>
			{"Max results:"}
			<textarea id="max-results" rows={1} cols={3} defaultValue={maxPaths} onChange={e => trySetMaxPaths(e.target.value)} />
		</label>
		<div className="path-display"> {
			allPaths
		} </div>
	</div>;
}

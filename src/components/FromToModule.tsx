import {DropDown} from './DropDown.tsx';
import {useRef} from 'react';

interface FromToModuleProps {
	entries: string[],
	onClick: (fromLoc: string, toLoc: string) => void,
	buttonTitle: string,
	idToNameMap: Record<string, string>
}

export function FromToModule(props: FromToModuleProps)
{
	const fromLoc = useRef<string|null>(null);
	const toLoc = useRef<string|null>(null);

	return <>
		<span>{"From:"}</span>
		<DropDown ids={props.entries}
		          idToNameMap={props.idToNameMap}
		          onChange={(entry:string)=>{fromLoc.current=entry}}
		/>
		<span>{"To:"}</span>
		<DropDown ids={props.entries}
		          idToNameMap={props.idToNameMap}
		          onChange={(entry:string)=>{toLoc.current=entry}}
		/>
		<button onClick={() => props.onClick(fromLoc.current,toLoc.current)}>
			{props.buttonTitle}
		</button>
	</>;
}

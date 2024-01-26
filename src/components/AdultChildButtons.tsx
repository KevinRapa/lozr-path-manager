import {useState} from 'react';

type LinkState = "ADULT"|"CHILD";

interface AdultChildButtonsProps {
	initialState: LinkState,
	onChange: (state: LinkState) => void
}

export function AdultChildButtons(props: AdultChildButtonsProps)
{
	const [state, setState] = useState<LinkState>(props.initialState);

	const onChange = (e) => {
		setState(e.target.value);
		props.onChange(e.target.value);
	};

	const RadioButton = (props: { name: string }): JSX.element => {
		return <label>
			{props.name}
			<input type="radio" name="time" value={props.name}
			       checked={state===props.name}
			       onChange={onChange}
			/>
		</label>
	}

	return <>
		<RadioButton name={"CHILD"} />
		<RadioButton name={"ADULT"} />
	</>
}

import { Collapse, ToggleButton, ToggleButtonProps } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export function SmallToggleButton({ children, selected, sx = {}, ...props }: ToggleButtonProps) {
	return (
		<ToggleButton
			selected={selected}
			sx={{
				py: 0,
				...sx,
			}}
			{...props}>
			<Collapse
				in={selected}
				orientation="horizontal"
				sx={{
					"& .MuiCollapse-wrapperInner": {
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					},
					mr: 0.5,
				}}>
				<CheckIcon fontSize="inherit" />
			</Collapse>
			{children}
		</ToggleButton>
	);
}

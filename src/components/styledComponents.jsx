import {Form, InputGroup} from 'react-bootstrap';
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styled from 'styled-components';

const colorPrimary= getComputedStyle(document.body).getPropertyValue('--bs-primary');

export const TittleModal = styled.h4`
  color: var(--bs-primary);
`

let arrowSelect= `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='none' stroke='${encodeURIComponent(colorPrimary)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/></svg>`

export const Select = styled(Form.Select)`
  border: none;
  box-shadow: none;
  border-radius: 0px;
  border-bottom: 2px solid var(--bs-primary);
  --bs-form-select-bg-img: url("${arrowSelect}");

  &:focus{
    box-shadow: none;
    border-bottom: 2px solid var(--bs-primary);
  }

  &:active{
    border-bottom: 2px solid var(--bs-primary);
  }

  &:focus-visible{
    border-bottom: 2px solid var(--bs-primary);
  }
`

export const InputGroupBtnInField = styled(InputGroup.Text)`
  border: none;
  box-shadow: none;
  border-radius: 0px;
  background: none;
  border-bottom: 2px solid var(--bs-primary);
  color: var(--bs-primary);
`

export const FaEyeIcon = styled(faEye)`
  color: var(--bs-primary);
`

export const FaEyeSlashIcon = styled(faEyeSlash)`
  color: var(--bs-primary);
`

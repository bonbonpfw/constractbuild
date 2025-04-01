import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {FaChevronDown} from 'react-icons/fa';
import {
  SelectContainer, SelectHeader, SelectList, SelectListItem
} from "../styles/SharedStyles";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({value, onChange, options}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside the select header and dropdown list
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(e.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When dropdown is open, compute its position relative to the select header
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <SelectContainer ref={selectRef}>
      <SelectHeader onClick={toggleDropdown}>
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <FaChevronDown/>
      </SelectHeader>
      {isOpen &&
        ReactDOM.createPortal(
          <SelectList style={dropdownStyles} ref={dropdownRef}>
            {options.map((opt) => (
              <SelectListItem key={opt.value} onClick={() => handleSelect(opt.value)}>
                {opt.label}
              </SelectListItem>
            ))}
          </SelectList>,
          document.body
        )}
    </SelectContainer>
  );
};

export default CustomSelect;

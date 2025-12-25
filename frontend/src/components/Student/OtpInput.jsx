import React, { useRef, useState, useEffect } from 'react';

const OtpInput = ({ length = 4, onComplete }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Allow only last entered digit
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Trigger complete
        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }

        // Move to next input if value is entered
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleClick = (index) => {
        inputRefs.current[index].setSelectionRange(1, 1);

        // Optional: if previous empty, move focus there
        if (index > 0 && !otp[index - 1]) {
            inputRefs.current[otp.indexOf("")].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="flex gap-4 justify-center my-6">
            {otp.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    ref={(input) => (inputRefs.current[index] = input)}
                    value={value}
                    onChange={(e) => handleChange(index, e)}
                    onClick={() => handleClick(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-20 text-center text-4xl font-bold rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-white text-indigo-700 shadow-sm"
                />
            ))}
        </div>
    );
};

export default OtpInput;

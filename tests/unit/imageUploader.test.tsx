// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { ImageUploader } from '../../src/components/common/ImageUploader';

const SAMPLE_PRESETS = [
  { label: 'ثلاجة نموذج', url: 'https://images.unsplash.com/photo-sample-fridge' },
  { label: 'غسالة نموذج', url: 'https://images.unsplash.com/photo-sample-washer' },
];

const Wrapper: React.FC<{ initialValue?: string }> = ({ initialValue = '' }) => {
  const [val, setVal] = useState(initialValue);
  return (
    <ImageUploader
      value={val}
      onChange={setVal}
      label="صورة المنتج"
      presets={SAMPLE_PRESETS}
      language="ar"
    />
  );
};

describe('ImageUploader Component', () => {
  it('renders upload dropzone and label in Arabic', () => {
    render(<Wrapper />);

    expect(screen.getByText('صورة المنتج')).toBeInTheDocument();
    expect(screen.getByText(/اضغط لاختيار صورة من جهازك/i)).toBeInTheDocument();
    expect(screen.getByText('رفع من الجهاز')).toBeInTheDocument();
    expect(screen.getByText('رابط مباشر (URL)')).toBeInTheDocument();
  });

  it('switches to URL input mode when clicking URL tab', () => {
    render(<Wrapper />);

    const urlTabBtn = screen.getByText('رابط مباشر (URL)');
    fireEvent.click(urlTabBtn);

    expect(screen.getByPlaceholderText(/رابط الصورة/i)).toBeInTheDocument();
  });

  it('selects preset when clicking a preset chip', () => {
    render(<Wrapper />);

    const presetBtn = screen.getByText('ثلاجة نموذج');
    fireEvent.click(presetBtn);

    // Live preview should be rendered
    expect(screen.getByText('تم تحميل الصورة')).toBeInTheDocument();
    expect(screen.getByText(/photo-sample-fridge/i)).toBeInTheDocument();
  });

  it('renders live preview card and allows clearing image', () => {
    render(<Wrapper initialValue="https://images.unsplash.com/photo-1584992236310-6edddc08acff" />);

    expect(screen.getByText('تم تحميل الصورة')).toBeInTheDocument();
    expect(screen.getByTitle('حذف الصورة')).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('حذف الصورة');
    fireEvent.click(deleteBtn);

    // After clearing, preview disappears and upload dropzone is visible
    expect(screen.queryByText('تم تحميل الصورة')).not.toBeInTheDocument();
    expect(screen.getByText(/اضغط لاختيار صورة من جهازك/i)).toBeInTheDocument();
  });

  it('displays error message if invalid non-image file is provided', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <ImageUploader value="" onChange={handleChange} language="ar" />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const textFile = new File(['dummy text content'], 'document.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [textFile] } });

    expect(screen.getByText(/الملف المحدد ليس صورة صالحة/i)).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });
});


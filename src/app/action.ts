'use server';

import { ApiError, fal } from '@fal-ai/client';
import { z } from 'zod';

const schema = z.object({
  prompt: z.string({
    invalid_type_error: 'Invalid Prompt',
  }),
  raw: z
    .boolean({
      invalid_type_error: 'Invalid Raw Mode',
    })
    .default(false),
  seed: z.number().int().optional(),
  aspect_ratio: z
    .enum(
      [
        '21:9',
        '16:9',
        '3:2',
        '4:3',
        '5:4',
        '1:1',
        '4:5',
        '3:4',
        '2:3',
        '9:16',
        '9:21',
      ],
      {
        invalid_type_error: 'Invalid Aspect Ratio',
      }
    )
    .default('1:1'),
  image_prompt: z.string().url().optional(),
  output_format: z
    .enum(['jpeg', 'png'], {
      invalid_type_error: 'Invalid Output Format',
    })
    .default('jpeg'),
  safety_tolerance: z.number().min(1).max(6).default(2),
  image_prompt_strength: z.number().min(0).max(1).default(0.1),
});

export const generateImage = async (previousState: any, formData: FormData) => {
  const formObject = Object.fromEntries(formData.entries());

  fal.config({
    credentials: formObject.api_key as string,
  });

  if (formObject.seed) {
    formObject.seed = Number(formObject.seed) as unknown as FormDataEntryValue;
  }

  formObject.raw = (formObject.raw === 'on' ||
    formObject.raw === 'true') as unknown as FormDataEntryValue;

  if (formObject.safety_tolerance) {
    formObject.safety_tolerance = Number(
      formObject.safety_tolerance
    ) as unknown as FormDataEntryValue;
  }

  const parsedData = schema.safeParse(formObject);

  if (!parsedData.success) {
    return {
      ...previousState,
      error: parsedData.error.errors.map((err) => err.message).join(', '),
    };
  }

  const {
    prompt,
    raw,
    seed,
    aspect_ratio,
    image_prompt,
    output_format,
    safety_tolerance,
    image_prompt_strength,
  } = parsedData.data;

  const input = {
    prompt,
    raw,
    seed,
    aspect_ratio,
    image_prompt,
    output_format,
    safety_tolerance: safety_tolerance.toString() as
      | '1'
      | '2'
      | '3'
      | '4'
      | '5'
      | '6',
    image_prompt_strength,
  };

  try {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input,
    });

    const {
      data: {
        images: [{ url: imageUrl }],
      },
    } = result;

    return {
      ...previousState,
      error: '',
      image: imageUrl,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ...previousState,
        error: error.message,
      };
    }

    return {
      ...previousState,
      error: `Error generating image`,
    };
  }
};

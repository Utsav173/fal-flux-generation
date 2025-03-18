'use client';

import { generateImage } from './action';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ModeToggler } from '@/components/ui/ModeToggler';
import { ListCollapseIcon, SparklesIcon, WandSparklesIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface State {
  image: any;
  error: string | null;
  prompt: string;
}

const initialState: State = {
  image: null,
  error: null,
  prompt: '',
};

const ApiKeyModal = ({
  handleApiKeyChange,
  isOpen,
}: {
  handleApiKeyChange: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isOpen: boolean;
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden rounded-md border-none shadow-md">
        <DialogHeader className="flex flex-col items-center my-3">
          <DialogTitle>API Key Modal</DialogTitle>
          <DialogDescription>
            This action save your API key state to use iamge generation feature
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          id="api-key"
          className="w-full p-2 text-sm border rounded-md border-green-400/65 focus-visible:ring-green-700"
          placeholder="Enter Your API Key"
          onKeyDown={handleApiKeyChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(
    generateImage,
    initialState
  );

  const [credentials, setCredentials] = useState<string>('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [outputFormat, setOutputFormat] = useState<string>('jpeg');
  const [safetyTolerance, setSafetyTolerance] = useState<number>(2);
  const [rawMode, setRawMode] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const handleApiKeyChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      setCredentials(e.currentTarget.value);
      setApiKeyModalOpen(false);
    }
  };

  const removeApiKey = () => {
    setCredentials('');
  };

  const handleFocusChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!credentials) {
      setApiKeyModalOpen(true);
    }
  };

  const onImageClick = () => {
    window.open(state.image, '_blank');
  };

  const handleSubmit = (formData: FormData) => {
    formData.append('api_key', credentials);
    formData.append('aspect_ratio', aspectRatio);
    formData.append('output_format', outputFormat);
    formData.append('safety_tolerance', safetyTolerance.toString());
    formData.append('raw', rawMode.toString());
    formAction(formData);
  };

  return (
    <div className="block min-h-screen">
      <ApiKeyModal
        handleApiKeyChange={handleApiKeyChange}
        isOpen={apiKeyModalOpen}
      />

      <div className="absolute top-5 right-5">
        <ModeToggler />
      </div>

      <div className="flex flex-col h-screen items-center">
        {/* Image rendering */}
        <div className="flex-grow overflow-hidden p-4">
          {isPending ? (
            <div className="h-full w-full flex items-center justify-center relative">
              <div className="content-center loader" />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              {state.image ? (
                <div className="imageContainer">
                  <img
                    src={state.image}
                    ref={imageRef}
                    alt="Generated image preview. Click to open in a new tab"
                    className="foregroundImg rounded-lg object-contain max-h-full max-w-full cursor-pointer"
                    onClick={onImageClick}
                  />
                  <img className="backgroundImg" src={state.image} />
                </div>
              ) : (
                <>
                  <WandSparklesIcon />
                  <div className="text-3xl max-md:text-xl text-nowrap w-full ml-2">
                    Flux Image Generator
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-5 flex-none w-full z-10">
          <form
            action={handleSubmit}
            className={cn(
              'max-w-[60vw] max-lg:max-w-[75vw] max-md:max-w-[95vw] w-full mx-auto my-4 z-10',
              {
                'opacity-50': isPending,
                'pointer-events-none': isPending,
                'cursor-not-allowed': isPending,
              }
            )}
          >
            <div className="flex items-center relative border rounded-[30px] max-md:rounded-[25px] w-full flex-1 custom-textarea-gradient shadow-md rounded-br-none bg-background/80 backdrop-blur-md">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-3 top-3.5 max-md:left-2 my-auto rounded-full"
                    type="button"
                  >
                    <ListCollapseIcon />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[calc(60vw_-_6px)] max-lg:w-[75vw] max-md:w-[calc(95vw+2px)] p-4 shadow-md rounded-[20px]"
                  align="start"
                  sideOffset={20}
                  alignOffset={-10}
                >
                  <div className="space-y-6">
                    {/* Aspect Ratio Section */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-6">
                        <div className="space-y-2">
                          <Label>Aspect Ratio</Label>
                          <Select
                            defaultValue={'1:1'}
                            disabled={isPending}
                            name="aspect_ratio"
                            onValueChange={(value) => setAspectRatio(value)}
                            value={aspectRatio}
                          >
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="1:1" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="21:9">21:9</SelectItem>
                              <SelectItem value="16:9">16:9</SelectItem>
                              <SelectItem value="3:2">3:2</SelectItem>
                              <SelectItem value="4:3">4:3</SelectItem>
                              <SelectItem value="5:4">5:4</SelectItem>
                              <SelectItem value="1:1">1:1</SelectItem>
                              <SelectItem value="4:5">4:5</SelectItem>
                              <SelectItem value="3:4">3:4</SelectItem>
                              <SelectItem value="2:3">2:3</SelectItem>
                              <SelectItem value="9:16">9:16</SelectItem>
                              <SelectItem value="9:21">9:21</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Aspect ratio for the generated image.
                          </p>
                        </div>
                      </div>

                      {/* Output Format Section */}
                      <div className="col-span-12 sm:col-span-6">
                        <div className="space-y-2">
                          <Label>Output Format</Label>
                          <Select
                            name="output_format"
                            defaultValue={'jpeg'}
                            value={outputFormat}
                            disabled={isPending}
                            onValueChange={(value) => setOutputFormat(value)}
                          >
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="jpeg" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="jpeg">JPEG</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Format of the output images.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Safety Tolerance Section */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-6">
                        <div className="space-y-2">
                          <Label>Safety Tolerance</Label>
                          <Slider
                            min={1}
                            max={6}
                            step={1}
                            name="safety_tolerance"
                            defaultValue={[5]}
                            value={[safetyTolerance]}
                            disabled={isPending}
                            onValueChange={(value) =>
                              setSafetyTolerance(value[0])
                            }
                          />
                          <p className="text-sm text-muted-foreground">
                            Safety tolerance, 1 is most strict and 6 is most
                            permissive.
                          </p>
                        </div>
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <div className="space-y-2">
                          <div className="flex gap-3 items-center">
                            <Label htmlFor="raw">Raw Mode</Label>
                            <Checkbox
                              disabled={isPending}
                              name="raw"
                              id="raw"
                              className="my-auto"
                              checked={rawMode}
                              onCheckedChange={(value) =>
                                setRawMode(value === true)
                              }
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Generate less processed, more natural-looking
                            images.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove API Key */}
                    {credentials && (
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                          <Button
                            onClick={removeApiKey}
                            className="w-full rounded-lg"
                            aria-label="Remove API Key"
                            variant={'destructive'}
                          >
                            Remove API Key
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Textarea
                placeholder="Enter image prompt here"
                className="max-h-[50vh] min-h-16 w-full px-4 py-3 max-md:py-2 border-none ml-10 pr-10 focus-visible:ring-0"
                defaultValue={state.prompt}
                onFocus={handleFocusChange}
                name="prompt"
              />

              <Button
                variant="default"
                size="icon"
                className="absolute right-3 bottom-3.5 max-md:right-2 my-auto rounded-full z-10"
                disabled={isPending}
                type="submit"
              >
                <SparklesIcon />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// frontend/src/components/AgendaForm.tsx
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, FileUp, X, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TalkingPoint } from '@/components/TalkingPoint';

import { clientMeetingTopics, generalMeetingTopics } from '@/config/topics';
import { advisors } from '@/config/advisors';

const clientFormSchema = z.object({
  clientName: z.string().min(1, { message: 'Client name is required.' }),
  meetingDate: z.date({ required_error: 'Meeting date is required.' }),
  advisorId: z.string({ required_error: 'Please select an advisor.' }),
  customInstructions: z.string().optional(),
});

const generalFormSchema = z.object({
  meetingTitle: z.string().min(1, { message: 'Meeting title is required.' }),
  meetingDate: z.date({ required_error: 'Meeting date is required.' }),
  meetingParticipants: z.string().optional(),
  meetingObjective: z.string().optional(),
  customInstructions: z.string().optional(),
});

interface TalkingPointType {
  id: string;
  title: string;
  notes: string;
}

interface AgendaFormProps {
  agendaType: 'client' | 'general';
}

export const AgendaForm: FC<AgendaFormProps> = ({ agendaType }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<TalkingPointType[]>([
    { id: 'default-point', title: agendaType === 'client' ? 'Portfolio Review' : 'Overview', notes: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const clientForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientName: '',
      advisorId: '',
      customInstructions: '',
    },
  });

  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      meetingTitle: '',
      meetingParticipants: '',
      meetingObjective: '',
      customInstructions: '',
    },
  });

  const currentForm = agendaType === 'client' ? clientForm : generalForm;
  const currentTopics = agendaType === 'client' ? clientMeetingTopics : generalMeetingTopics;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      toast({
        title: 'File uploaded',
        description: selectedFile.name,
      });
    }
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const addTalkingPoint = (title: string) => {
    const newPoint = {
      id: `tp-${Date.now()}`,
      title,
      notes: '',
    };
    setTalkingPoints([...talkingPoints, newPoint]);
  };

  const addCustomTopic = () => {
    addTalkingPoint('Custom Topic');
  };

  const handleTalkingPointDelete = (id: string) => {
    setTalkingPoints(talkingPoints.filter((point) => point.id !== id));
  };

  const handleTalkingPointEdit = (id: string, title: string, notes: string) => {
    setTalkingPoints(
      talkingPoints.map((point) =>
        point.id === id ? { ...point, title, notes } : point
      )
    );
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.index === 0) return;
    if (result.destination.index === 0) return;

    const items = Array.from(talkingPoints);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTalkingPoints(items);
  };

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      setShowValidation(true);

      const formData = new FormData();
      formData.append('agendaType', agendaType);
      formData.append('talkingPoints', JSON.stringify(talkingPoints));

      if (file) {
        formData.append('file', file);
      }

      if (agendaType === 'client') {
        formData.append('clientName', values.clientName);
        formData.append('meetingDate', format(values.meetingDate, 'MMMM dd, yyyy'));
        formData.append('advisorId', values.advisorId);

        const selectedAdvisor = advisors.find(a => a.id === values.advisorId);
        if (selectedAdvisor) {
          formData.append('advisorPreferences', selectedAdvisor.preferences);
        }
      } else {
        formData.append('meetingTitle', values.meetingTitle);
        formData.append('meetingDate', format(values.meetingDate, 'MMMM dd, yyyy'));
        formData.append('meetingParticipants', values.meetingParticipants || '');
        formData.append('meetingObjective', values.meetingObjective || '');
      }

      formData.append('customInstructions', values.customInstructions || '');

      const response = await axios.post('http://localhost:3001/api/generate-agenda', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      const filename = agendaType === 'client'
        ? `${values.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_agenda.docx`
        : `${values.meetingTitle.replace(/[^a-zA-Z0-9]/g, '_')}_agenda.docx`;

      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Agenda Generated',
        description: `Successfully created agenda with ${talkingPoints.length} talking points.`,
      });
    } catch (error) {
      console.error('Error generating agenda:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate agenda. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderClientForm = () => (
    <Form {...clientForm}>
      <form className="space-y-6" onSubmit={clientForm.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Client info and PDF upload */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 transition-all hover:border-primary/40 hover:bg-primary/5">
              <div className="flex flex-col items-center justify-center">
                <FileUp className="mb-2 h-8 w-8 text-gray-400" />
                <h3 className="mb-1 text-sm font-medium">Upload PDF (Optional)</h3>
                <p className="mb-3 text-xs text-gray-500 text-center">
                  Drag and drop or click to upload client performance report
                </p>
                <div className="w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex w-full cursor-pointer justify-center"
                  >
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <div className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">
                      Select File
                    </div>
                  </label>
                </div>
                {file && (
                  <div className="mt-3 flex items-center rounded-md bg-gray-100 px-3 py-2 w-full">
                    <span className="truncate text-sm flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={handleFileRemove}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Client Name */}
            <FormField
              control={clientForm.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Client Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter client name"
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Meeting Date */}
              <FormField
                control={clientForm.control}
                name="meetingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium text-gray-700">Meeting Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-gray-300",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {showValidation && <FormMessage />}
                  </FormItem>
                )}
              />
              {/* Advisor Selection */}
              <FormField
                control={clientForm.control}
                name="advisorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Select Advisor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select an advisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {advisors.map((advisor) => (
                          <SelectItem
                            key={advisor.id}
                            value={advisor.id}
                          >
                            {advisor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showValidation && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>
            {/* Custom Instructions */}
            <FormField
              control={clientForm.control}
              name="customInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Custom Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any specific instructions for the AI..."
                      className="min-h-[120px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />
          </div>

          {/* Right Column - Talking points */}
          <div className="space-y-6">
            {/* Talking Points */}
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Talking Points</h3>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="talking-points">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {talkingPoints.map((point, index) => (
                        <Draggable
                          key={point.id}
                          draggableId={point.id}
                          index={index}
                          isDragDisabled={index === 0}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TalkingPoint
                                id={point.id}
                                title={point.title}
                                notes={point.notes}
                                index={index}
                                isFixed={index === 0}
                                onDelete={handleTalkingPointDelete}
                                onEdit={handleTalkingPointEdit}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="mt-5 space-y-3">
                <p className="text-xs text-gray-500 font-medium">Add talking points:</p>
                <div className="flex flex-wrap gap-2">
                  {currentTopics.map((topic) => (
                    <Button
                      key={topic.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTalkingPoint(topic.label)}
                      className="bg-white text-xs hover:bg-primary/5 border-gray-300"
                    >
                      {topic.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomTopic}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary flex items-center gap-1 text-xs hover:bg-primary/10"
                  >
                    <Plus size={14} />
                    Custom Topic
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-6 border-t border-gray-100">
          <Button
            type="submit"
            className="min-w-[200px] bg-primary hover:bg-primary/90 font-medium py-6 text-base"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Agenda"}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderGeneralForm = () => (
    <Form {...generalForm}>
      <form className="space-y-6" onSubmit={generalForm.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Meeting info */}
          <div className="space-y-6">
            {/* Meeting Title */}
            <FormField
              control={generalForm.control}
              name="meetingTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Meeting Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter meeting title"
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />

            {/* Meeting Date */}
            <FormField
              control={generalForm.control}
              name="meetingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700">Meeting Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-gray-300",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />

            {/* Meeting Participants */}
            <FormField
              control={generalForm.control}
              name="meetingParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Participants (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List meeting participants..."
                      className="min-h-[80px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />

            {/* Meeting Objective */}
            <FormField
              control={generalForm.control}
              name="meetingObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Meeting Objective (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this meeting..."
                      className="min-h-[80px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />

            {/* Custom Instructions */}
            <FormField
              control={generalForm.control}
              name="customInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Custom Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any specific instructions for the AI..."
                      className="min-h-[80px] resize-none border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />
          </div>

          {/* Right Column - Talking points */}
          <div className="space-y-6">
            {/* Talking Points */}
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Agenda Items</h3>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="talking-points">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {talkingPoints.map((point, index) => (
                        <Draggable
                          key={point.id}
                          draggableId={point.id}
                          index={index}
                          isDragDisabled={index === 0}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TalkingPoint
                                id={point.id}
                                title={point.title}
                                notes={point.notes}
                                index={index}
                                isFixed={index === 0}
                                onDelete={handleTalkingPointDelete}
                                onEdit={handleTalkingPointEdit}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="mt-5 space-y-3">
                <p className="text-xs text-gray-500 font-medium">Add agenda items:</p>
                <div className="flex flex-wrap gap-2">
                  {currentTopics.map((topic) => (
                    <Button
                      key={topic.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTalkingPoint(topic.label)}
                      className="bg-white text-xs hover:bg-primary/5 border-gray-300"
                    >
                      {topic.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomTopic}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary flex items-center gap-1 text-xs hover:bg-primary/10"
                  >
                    <Plus size={14} />
                    Custom Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-6 border-t border-gray-100">
          <Button
            type="submit"
            className="min-w-[200px] bg-primary hover:bg-primary/90 font-medium py-6 text-base"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Agenda"}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <Card className="overflow-hidden shadow-xl border-primary/10">
      <CardHeader className="bg-primary/5 border-b py-5">
        <CardTitle className="text-center text-2xl font-bold text-primary">
          {agendaType === 'client' ? 'Client Meeting Agenda' : 'General Meeting Agenda'}
        </CardTitle>
        <CardDescription className="text-center text-base">
          Create professional meeting agendas powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {agendaType === 'client' ? renderClientForm() : renderGeneralForm()}
      </CardContent>
    </Card>
  );
};